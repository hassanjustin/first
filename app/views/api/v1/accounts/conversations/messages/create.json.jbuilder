json.id @message.id
json.content @message.content
json.inbox_id @message.inbox_id
json.conversation_id @message.conversation.display_id
json.message_type @message.message_type_before_type_cast
json.content_type @message.content_type
json.content_attributes @message.content_attributes
json.created_at @message.created_at.to_i
json.private @message.private
json.attachments @message.attachments.map(&:push_event_data) if @message.attachments.present?
jscon.contact @message.contact.push_event_data if @message.contact
