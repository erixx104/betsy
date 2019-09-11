// ~store/modules/games.js

const bets = {
  firestorePath: 'games/{gameID}/bets',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'bets',
  statePropName: 'synced',
  namespaced: true, // automatically added
  serverChange: {
    convertTimestamps: {
      updated_at: '%convertTimestamp%',
      created_at: '%convertTimestamp%',
    },
  },

  // this object is your store module (will be added as '/games')
  // you can also add state/getters/mutations/actions
  state: {},
  getters: {
    // list the bets, ordered by created
    list (state) {
     //return state.synced
      if((state.synced!= null)&&(state.synced!=undefined))
        return Object.values(state.synced).sort(function (a, b) {
        if (a.created_at === undefined || b.created_at === undefined) {
          console.log('a → ', a.created_at)
          console.log('b → ', b.created_at)
          return a
        }
        return b.created_at - a.created_at
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
    
    listFinishState (state) {
     //return state.synced
      if( (state.synced!= null) && (state.synced!=undefined) )
        return Object.values(state.synced)
          .filter(bet => (bet.state=="winner"||bet.state=="agreed"||bet.state=="noWinner") )
          .sort((betA, betB) => { return betA["createdAt"] - betB["createdAt"] })
      else
        return null
    },
    
    bet: state => betID => {
      if( (state.synced!= null) && (state.synced!=undefined) && (betID in state.synced))
        return state.synced[betID]
      else
        return null
    },
    
    getVerdictList (state, getters) {
        let verdictList = {}
        for(var bet of getters.listActiveState){
         // if(bet.state=="running"){
            if("verdict" in bet)
              Object.assign(verdictList, { [bet.id]: Object.keys(bet.verdict).length});
            else if(bet.state=="running")
              Object.assign(verdictList, { [bet.id]: 0});
          //}
        }
        return verdictList
    }
  },
  mutations: {},
  actions: {},
}

export default bets