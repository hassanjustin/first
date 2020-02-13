require 'rails_helper'
describe WebhookListener do
  let(:listener) { described_class.instance }
  let!(:account) { create(:account) }
  let(:report_identity) { Reports::UpdateAccountIdentity.new(account, Time.zone.now) }
  let!(:user) { create(:user, account: account) }
  let!(:inbox) { create(:inbox, account: account) }
  let!(:conversation) { create(:conversation, account: account, inbox: inbox, assignee: user) }
  let!(:message) do
    create(:message, message_type: 'outgoing',
                     account: account, inbox: inbox, conversation: conversation)
  end
  let!(:event) { Events::Base.new(event_name, Time.zone.now, message: message) }

  describe '#message_created' do
    let(:event_name) { :'conversation.created' }

    context 'when webhook is not configured' do
      it 'does not trigger webhook' do
        allow(RestClient).to receive(:post).exactly(0).times
        listener.message_created(event)
      end
    end

    context 'when webhook is configured' do
      it 'triggers webhook' do
        create(:webhook, inbox: inbox, account: account)
        allow(Webhooks::Trigger).to receive(:execute).once
        listener.message_created(event)
      end
    end
  end
end
