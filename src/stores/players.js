// ~store/modules/games.js

const players = {
  firestorePath: 'games/{gameID}/players',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'players',
  statePropName: 'synced',
  namespaced: true, // automatically added

  // this object is your store module (will be added as '/games')
  // you can also add state/getters/mutations/actions
  state: {},
  getters: {
    // list the players, ordered by score
    list (state) {
     //return state.synced
      if((state.synced!= null)&&(state.synced!=undefined))
        return Object.values(state.synced).sort((playerA, playerB) => {
          return playerB["score"] - playerA["score"]
        })
      else
        return null
    },
    
    listActive (state) {
     //return state.synced
      if((state.synced!= null)&&(state.synced!=undefined))
        return Object.values(state.synced)
          .filter(player => ( (player.last_online+120000)>Date.now()) )
          .sort((playerA, playerB) => {
          return playerB["score"] - playerA["score"]
        })
      else
        return null
    },
    
    // get Last on from specific User
    getUserLastOn: state => userID => {
       return state.synced[userID].last_online
      }
  },
  mutations: {
    reset (state) {
      state.synced=null
    }
  },
  actions: {
    reset ({commit}) {
      commit('reset')
    },

  }
  
}

export default players