class Conversation < ApplicationRecord
  include Events::Types

  validates :account_id, presence: true
  validates :inbox_id, presence: true

  enum status: [:open, :resolved]

  scope :latest, -> { order(created_at: :desc) }
  scope :unassigned, -> { where(assignee_id: nil) }
  scope :assigned_to, ->(agent) { where(assignee_id: agent.id) }

  belongs_to :account
  belongs_to :inbox
  belongs_to :assignee, class_name: 'User', optional: true
  belongs_to :sender, class_name: 'Contact'

  has_many :messages, dependent: :destroy, autosave: true

  before_create :set_display_id, unless: :display_id?

  after_update :notify_status_change, :create_activity, :send_email_notification_to_assignee

  after_create :send_events, :run_round_robin

  acts_as_taggable_on :labels

  def update_assignee(agent = nil)
    update!(assignee: agent)
  end

  def update_labels(labels = nil)
    update!(label_list: labels)
  end

  def toggle_status
    self.status = open? ? :resolved : :open
    save
  end

  def lock!
    update!(locked: true)
  end

  def unlock!
    update!(locked: false)
  end

  def unread_messages
    messages.unread_since(agent_last_seen_at)
  end

  def unread_incoming_messages
    messages.incoming.unread_since(agent_last_seen_at)
  end

  def push_event_data
    Conversations::EventDataPresenter.new(self).push_data
  end

  def lock_event_data
    Conversations::EventDataPresenter.new(self).lock_data
  end

  private

  def dispatch_events
    dispatcher_dispatch(CONVERSATION_RESOLVED)
  end

  def send_events
    dispatcher_dispatch(CONVERSATION_CREATED)
  end

  def send_email_notification_to_assignee
    AssignmentMailer.conversation_assigned(self, assignee).deliver if saved_change_to_assignee_id? && assignee_id.present? && !self_assign?(assignee_id)
  end

  def self_assign?(assignee_id)
    assignee_id.present? && Current.user&.id == assignee_id
  end

  def set_display_id
    self.display_id = loop do
      next_display_id = account.conversations.maximum('display_id').to_i + 1
      break next_display_id unless account.conversations.exists?(display_id: next_display_id)
    end
  end

  def create_activity
    return unless Current.user

    user_name = Current.user&.name

    create_status_change_message(user_name) if saved_change_to_assignee_id?
    create_assignee_change(user_name) if saved_change_to_assignee_id?
  end

  def activity_message_params(content)
    {
      account_id: account_id,
      inbox_id: inbox_id,
      message_type: :activity,
      content: content
    }
  end

  def notify_status_change
    resolve_conversation if saved_change_to_status?
    dispatcher_dispatch(CONVERSATION_READ) if saved_change_to_user_last_seen_at?
    dispatcher_dispatch(CONVERSATION_LOCK_TOGGLE) if saved_change_to_locked?
    dispatcher_dispatch(ASSIGNEE_CHANGED) if saved_change_to_assignee_id?
  end

  def resolve_conversation
    dispatcher_dispatch(CONVERSATION_RESOLVED) if resolved? && assignee.present?
  end

  def dispatcher_dispatch(event_name)
    Rails.configuration.dispatcher.dispatch(event_name, Time.zone.now, conversation: self)
  end

  def run_round_robin
    # return unless conversation.account.has_feature?(round_robin)
    # return unless conversation.account.round_robin_enabled?
    return if assignee

    new_assignee = inbox.next_available_agent
    update_assignee(new_assignee) if new_assignee
  end

  def create_status_change_message(user_name)
    content = I18n.t("conversations.activity.status.#{status}", user_name: user_name)

    messages.create(activity_message_params(content))
  end

  def create_assignee_change(user_name)
    params = { assignee_name: assignee&.name, user_name: user_name }.compact
    key = assignee_id ? 'assigned' : 'removed'
    content = I18n.t("conversations.activity.assignee.#{key}", params)

    messages.create(activity_message_params(content))
  end
end
