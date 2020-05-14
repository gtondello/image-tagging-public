import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const ACTION_LOGIN = 'login'
export const ACTION_LOGOUT = 'logout'

export default new Vuex.Store({
  state: {
    user: null
  },
  getters: {
    // Returns true if the user is authenticated (user is not null)
    isAuthenticated: state => {
      return state.user !== null;
    }
  },
  mutations: {
    // Sets the user in the store
    setUser (state, _user) {
      state.user = _user;
    }
  },
  actions: {
    // Sets the user in the store
    login ({ commit }, _user) {
      commit('setUser', _user);
    },
    // Clears the user in the stores (sets it to null)
    logout ({ commit }) {
      commit('setUser', null);
    }
  }
})