class Api::V1::Widget::MessagesController < ActionController::Base
  before_action :set_conversation, only: [:create]

  def index
    @messages = conversation.nil? ? [] : message_finder.perform
  end

  def create
    @message = conversation.messages.new(message_params)
    @message.save!
  end

  private

  def conversation
    @conversation ||= ::Conversation.find_by(
      contact_id: cookie_params[:contact_id],
      inbox_id: cookie_params[:inbox_id]
    )
  end

  def set_conversation
    @conversation = ::Conversation.create!(conversation_params) if conversation.nil?
  end

  def message_params
    {
      account_id: conversation.account_id,
      inbox_id: conversation.inbox_id,
      message_type: :incoming,
      content: permitted_params[:content]
    }
  end

  def conversation_params
    {
      account_id: inbox.account_id,
      inbox_id: inbox.id,
      contact_id: cookie_params[:contact_id]
    }
  end

  def inbox
    @inbox ||= ::Inbox.find_by(id: cookie_params[:inbox_id])
  end

  def cookie_params
    JSON.parse(cookies.signed[:cw_conversation]).symbolize_keys
  end

  def message_finder
    @message_finder ||= MessageFinder.new(conversation, params)
  end

  def permitted_params
    params.fetch(:message).permit(:content)
  end
end
