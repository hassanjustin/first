module MessageFormatHelper
  include RegexHelper

  def transform_user_mention_content(message_content)
    if message_content
      message_content.gsub(MENTION_REGEX, '\1')
    else
      ''
    end
  end

  def render_message_content(message_content)
    # rubocop:disable Rails/OutputSafety
    CommonMarker.render_html(message_content).html_safe
    # rubocop:enable Rails/OutputSafety
  end
end
