// ~store/modules/games.js

const games = {
  firestorePath: 'games',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'games',
  statePropName: 'synced',
  namespaced: true, // automatically added

  // this object is your store module (will be added as '/games')
  // you can also add state/getters/mutations/actions
  state: {},
  getters: {
    // list all games
    listGames (state) {
        const result = []
        for (var key in state.synced){
            result.push(state.synced[key])
        }
        return result
    },
    
    //check, if game exists
    gameExists: (state) => (link) => {
        for (var key in state.synced) {
            if(state.synced[key].link==link)
                return true
        }
        return false
    },
    
    //retrieve id for specific link
    getIdForLink: (state) => (link) => {
        for (var key in state.synced) {
            if(state.synced[key].link==link)
                return key
        }
        return false    
    }
  },
  mutations: {},
  actions: {},
}

export default games