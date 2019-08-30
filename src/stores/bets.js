// ~store/modules/games.js

const bets = {
  firestorePath: 'games/{gameID}/bets',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'bets',
  statePropName: 'synced',
  namespaced: true, // automatically added

  // this object is your store module (will be added as '/games')
  // you can also add state/getters/mutations/actions
  state: {},
  getters: {
    // list the bets, ordered by created
    list (state) {
     //return state.synced
      if((state.synced!= null)&&(state.synced!=undefined))
        return Object.values(state.synced).sort((betA, betB) => {
          return betB["createdAt"] - betA["createdAt"]
        })
      else
        return null
    },
    

    listActiveState (state) {
     //return state.synced
      if( (state.synced!= null) && (state.synced!=undefined) )
        return Object.values(state.synced)
          .filter(bet => (bet.state=="requested"||bet.state=="running") )
          .sort((betA, betB) => { return betA["createdAt"] - betB["createdAt"] })
      else
        return null
    },
    
    bet: state => betID => {
      console.log(betID)
      console.log(state.synced)
      console.log(state.synced[betID])
      if( (state.synced!= null) && (state.synced!=undefined) && (betID in state.synced))
        return state.synced[betID]
      else
        return null
      
    }
  },
  mutations: {},
  actions: {},
}

export default bets