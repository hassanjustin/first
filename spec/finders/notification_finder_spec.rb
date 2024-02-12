require 'rails_helper'

describe NotificationFinder do
  subject(:notification_finder) { described_class.new(user, account, params) }

  let!(:account) { create(:account) }
  let!(:user) { create(:user, account: account) }

  before do
    create(:notification, account: account, user: user, updated_at: DateTime.now.utc + 1.day, last_activity_at: DateTime.now.utc + 1.day,
                          read_at: DateTime.now.utc, snoozed_until: nil)
    create(:notification, account: account, user: user, updated_at: DateTime.now.utc + 4.days, last_activity_at: DateTime.now.utc + 4.days,
                          notification_type: :conversation_creation, read_at: DateTime.now.utc, snoozed_until: nil)

    create(:notification, account: account, user: user, snoozed_until: DateTime.now.utc + 3.days, updated_at: DateTime.now.utc,
                          last_activity_at: DateTime.now.utc, read_at: nil)
    create(:notification, account: account, user: user, updated_at: DateTime.now.utc + 2.days, last_activity_at: DateTime.now.utc + 2.days,
                          snoozed_until: nil,  read_at: nil)
    create(:notification, account: account, user: user, updated_at: DateTime.now.utc + 5.days, last_activity_at: DateTime.now.utc + 5.days,
                          notification_type: :conversation_mention, snoozed_until: nil, read_at: nil)
    create(:notification, account: account, user: user, updated_at: DateTime.now.utc + 6.days, last_activity_at: DateTime.now.utc + 6.days,
                          notification_type: :participating_conversation_new_message, snoozed_until: nil, read_at: nil)
  end

  describe '#perform' do
    context 'when params are empty' do
      let(:params) { {} }

      it 'returns all the notifications' do
        result = notification_finder.perform
        expect(result.length).to be 4
      end

      it 'orders notifications by last activity at' do
        result = notification_finder.perform
        expect(result.first.last_activity_at).to be > result.last.last_activity_at
      end

      it 'returns unread count' do
        result = notification_finder.unread_count
        expect(result).to be 4
      end

      it 'returns count' do
        result = notification_finder.count
        expect(result).to be 4
      end
    end

    context 'when type read and status snoozed is passed' do
      let(:params) { { type: 'read', status: 'snoozed' } }

      it 'returns only read notifications' do
        result = notification_finder.perform
        expect(result.length).to be 6
      end

      it 'returns count' do
        result = notification_finder.count
        expect(result).to be 6
      end

      it 'returns unread count' do
        result = notification_finder.unread_count
        expect(result).to be 4
      end
    end

    context 'when type read and status snoozed is nil is passed' do
      let(:params) { { type: 'read', status: nil } }

      it 'returns non-snoozed and read notifications' do
        result = notification_finder.perform
        expect(result.length).to be 5
      end

      it 'returns count' do
        result = notification_finder.count
        expect(result).to be 5
      end

      it 'returns unread count' do
        result = notification_finder.unread_count
        expect(result).to be 3
      end
    end

    context 'when type is nil and status snoozed is passed' do
      let(:params) { { type: nil, status: 'snoozed' } }

      it 'returns snoozed and unread notifications' do
        result = notification_finder.perform
        expect(result.length).to be 1
      end

      it 'returns count' do
        result = notification_finder.count
        expect(result).to be 1
      end

      it 'returns unread count' do
        result = notification_finder.unread_count
        expect(result).to be 1
      end
    end

    context 'when sort order is passed' do
      let(:params) { { sort_order: :asc } }

      it 'returns notifications in ascending order' do
        result = notification_finder.perform
        expect(result.first.last_activity_at).to be < result.last.last_activity_at
      end
    end
  end
end
