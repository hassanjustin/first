import Vue from 'vue';
import types from '../mutation-types';
import authAPI from '../../api/auth';
import { setUser, getHeaderExpiry, clearCookiesOnLogout } from '../utils/api';
import { getLoginRedirectURL } from '../../helper/URLHelper';

const initialState = {
  currentUser: {
    id: null,
    account_id: null,
    accounts: [],
    email: null,
    name: null,
  },
  currentAccountId: null,
  uiFlags: {
    isFetching: true,
  },
};

// getters
export const getters = {
  isLoggedIn($state) {
    return !!$state.currentUser.id;
  },

  getCurrentUserID($state) {
    return $state.currentUser.id;
  },

  getUISettings($state) {
    return $state.currentUser.ui_settings || {};
  },

  getAuthUIFlags($state) {
    return $state.uiFlags;
  },

  getCurrentUserAvailability($state) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $state.currentAccountId
    );
    return currentAccount.availability;
  },

  getCurrentAccountId(_, __, rootState) {
    if (rootState.route.params && rootState.route.params.accountId) {
      return Number(rootState.route.params.accountId);
    }
    return null;
  },

  getCurrentRole($state) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $state.currentAccountId
    );
    return currentAccount.role;
  },

  getCurrentUser($state) {
    return $state.currentUser;
  },

  getMessageSignature($state) {
    const { message_signature: messageSignature } = $state.currentUser;

    return messageSignature || '';
  },

  getCurrentAccount($state) {
    const { accounts = [] } = $state.currentUser;
    const [currentAccount = {}] = accounts.filter(
      account => account.id === $state.currentAccountId
    );
    return currentAccount || {};
  },

  getUserAccounts($state) {
    const { accounts = [] } = $state.currentUser;
    return accounts;
  },
};

// actions
export const actions = {
  login(_, { ssoAccountId, ...credentials }) {
    return new Promise((resolve, reject) => {
      authAPI
        .login(credentials)
        .then(response => {
          window.location = getLoginRedirectURL(ssoAccountId, response.data);
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  async validityCheck(context) {
    try {
      const response = await authAPI.validityCheck();
      const currentUser = response.data.payload.data;
      setUser(currentUser, getHeaderExpiry(response), {
        setUserInSDK: true,
      });
      context.commit(types.SET_CURRENT_USER, currentUser);
    } catch (error) {
      if (error?.response?.status === 401) {
        clearCookiesOnLogout();
      }
    }
  },
  async setUser({ commit, dispatch }) {
    if (authAPI.hasAuthCookie()) {
      await dispatch('validityCheck');
    } else {
      commit(types.CLEAR_USER);
    }
    commit(types.SET_CURRENT_USER_UI_FLAGS, { isFetching: false });
  },
  logout({ commit }) {
    commit(types.CLEAR_USER);
  },

  updateProfile: async ({ commit }, params) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await authAPI.profileUpdate(params);
      setUser(response.data, getHeaderExpiry(response));
      commit(types.SET_CURRENT_USER, response.data);
    } catch (error) {
      throw error;
    }
  },

  deleteAvatar: async () => {
    try {
      await authAPI.deleteAvatar();
    } catch (error) {
      // Ignore error
    }
  },

  updateUISettings: async ({ commit }, params) => {
    try {
      commit(types.SET_CURRENT_USER_UI_SETTINGS, params);
      const response = await authAPI.updateUISettings(params);
      setUser(response.data, getHeaderExpiry(response));
      commit(types.SET_CURRENT_USER, response.data);
    } catch (error) {
      // Ignore error
    }
  },

  updateAvailability: async ({ commit, dispatch }, params) => {
    try {
      const response = await authAPI.updateAvailability(params);
      const userData = response.data;
      const { id } = userData;
      setUser(userData, getHeaderExpiry(response));
      commit(types.SET_CURRENT_USER, response.data);
      dispatch('agents/updatePresence', { [id]: params.availability });
    } catch (error) {
      // Ignore error
    }
  },

  setCurrentAccountId({ commit }, accountId) {
    commit(types.SET_CURRENT_ACCOUNT_ID, accountId);
  },

  setCurrentUserAvailability({ commit, state: $state }, data) {
    if (data[$state.currentUser.id]) {
      commit(types.SET_CURRENT_USER_AVAILABILITY, data[$state.currentUser.id]);
    }
  },
};

// mutations
export const mutations = {
  [types.SET_CURRENT_USER_AVAILABILITY](_state, availability) {
    Vue.set(_state.currentUser, 'availability', availability);
  },
  [types.CLEAR_USER](_state) {
    _state.currentUser = initialState.currentUser;
  },
  [types.SET_CURRENT_USER](_state, currentUser) {
    Vue.set(_state, 'currentUser', currentUser);
  },
  [types.SET_CURRENT_USER_UI_SETTINGS](_state, { uiSettings }) {
    Vue.set(_state, 'currentUser', {
      ..._state.currentUser,
      ui_settings: {
        ..._state.currentUser.ui_settings,
        ...uiSettings,
      },
    });
  },

  [types.SET_CURRENT_USER_UI_FLAGS](_state, { isFetching }) {
    Vue.set(_state, 'uiFlags', { isFetching });
  },
  [types.SET_CURRENT_ACCOUNT_ID](_state, accountId) {
    Vue.set(_state, 'currentAccountId', Number(accountId));
  },
};

export default {
  state: initialState,
  getters,
  actions,
  mutations,
};
