import Vue from 'vue';
import types from '../mutation-types';

import ConversationInboxApi from '../../api/inbox/conversation';

const state = {
  records: {},
  uiFlags: {
    isFetching: false,
    isUpdating: false,
  },
};

export const getters = {
  getUIFlags($state) {
    return $state.uiFlags;
  },
  getByConversationId: _state => conversationId => {
    return _state.records[conversationId];
  },
};

export const actions = {
  show: async ({ commit }, conversationId) => {
    commit(types.SET_CONVERSATION_WATCHERS_UI_FLAG, {
      isFetching: true,
    });

    try {
      const response = await ConversationInboxApi.fecthParticipants(
        conversationId
      );
      commit(types.SET_CONVERSATION_WATCHERS, {
        conversationId,
        data: response.data,
      });
    } catch (error) {
      throw new Error(error);
    } finally {
      commit(types.SET_CONVERSATION_WATCHERS_UI_FLAG, {
        isFetching: false,
      });
    }
  },

  update: async ({ commit }, conversationId, userIds) => {
    commit(types.SET_CONVERSATION_WATCHERS_UI_FLAG, {
      isUpdating: true,
    });

    try {
      const response = await ConversationInboxApi.updateParticipants({
        conversationId,
        userIds,
      });
      commit(types.SET_CONVERSATION_WATCHERS, {
        conversationId,
        data: response.data,
      });
    } catch (error) {
      throw new Error(error);
    } finally {
      commit(types.SET_CONVERSATION_WATCHERS_UI_FLAG, {
        isUpdating: false,
      });
    }
  },
};

export const mutations = {
  [types.SET_CONVERSATION_WATCHERS_UI_FLAG](_state, data) {
    _state.uiFlags = {
      ..._state.uiFlags,
      ...data,
    };
  },

  [types.SET_CONVERSATION_WATCHERS]($state, { data, conversationId }) {
    Vue.set($state.records, conversationId, data);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
