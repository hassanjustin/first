class Instagram::ReadStatusService < Instagram::WebhooksBaseService
  pattr_initialize [:params!]

  def perform
    return if instagram_channel.blank?

    process_status if message.present?
  end

  def process_status
    @message.status = 'read'
    @message.save!
  end

  def instagram_id
    params[:recipient][:id]
  end

  def instagram_channel
    @instagram_channel ||= Channel::FacebookPage.find_by(instagram_id: instagram_id)
  end

  def message
    return unless params[:read][:mid]

    @message ||= @instagram_channel.inbox.messages.find_by(source_id: params[:read][:mid])
  end
end
