import Vue from 'vue'
import Vuex from 'vuex'
import VuexEasyFirestore from 'vuex-easy-firestore'
import { Firebase, initFirebase } from './config/firebase.js'
import games from './stores/games.js'
import bets from './stores/bets.js'
import players from './stores/players.js'
//import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

// do the magic
const easyFirestore = VuexEasyFirestore(
  [games, players, bets],
  {logging: true, FirebaseDependency: Firebase}
)



const storeData = {
  plugins: [easyFirestore], //, createPersistedState()],
  state: {
    user: null,
    loader : false
  },

  mutations: {

    setUser (state, payload) {
      state.user=payload
    },
    
    setLoader (state, payload) {
      state.loader=payload
    }

  },
  computed: {
  },
  
  actions: {

    enterGame({state,dispatch}) {
      return new Promise((resolve, reject) => {
        if((state.user.activeGame != '' && state.user.activeGame != null && state.user.activeGame != undefined)){

          //close connection to games overview
          dispatch('games/closeDBChannel')
            .catch((error) => {reject("close GameDB ging nicht: "+error)})
          
          //open connection to game-specific players....
          dispatch('players/openDBChannel',{gameID: state.user.activeGame})
            .catch((error) => {reject("open Player DB ging nicht: "+error)})
            .then(() =>{
              //add current user
              dispatch('players/insert', Object.assign(state.user, {score:10, last_online:Date.now()}))
                .catch((error) => {reject("insert user in players ging nicht: "+error)})
                .then(() =>{
                  //...and bets overview
                  dispatch('bets/openDBChannel',{gameID: state.user.activeGame})
                    .catch((error) => {reject("open Bets DB ging nicht: "+error)})
                    .then(() =>{
                      console.log('Signed In')  
                      resolve("läuft!")
                })
            })
          })
          
          
  
          
        }else{
          reject("hat garnicht geklappt")
        }
        
      })
      
    },
    
    leaveGame({state, dispatch}) {
       return new Promise((resolve, reject) => {

        //set 'activeGame' @ Player (in Games) to null to indicate, that the user actively left the game
        dispatch('players/patch', {id : state.user.id, activeGame : null })
                    .catch(console.error)
                    .then(() =>{})

        //close connection to game-specific players....
        dispatch('players/closeDBChannel', {clearModule: true})
            .catch((error) => {reject("close PlayersDB ging nicht: "+error)}).then(() => {
              //close connection to game-specific bets....
              dispatch('bets/closeDBChannel', {clearModule: true})
                .catch((error) => {reject("close BetsDB ging nicht: "+error)}).then(() => {
                  //remove user from Realtime-Database
                  Firebase.database().ref('/users/' + state.user.id).remove().then(() => {
                    //open connection to games overview
                    dispatch('games/openDBChannel',{where: [['active','==',true]]})
                      .catch((error) => {reject("Konnte Kanal zur Games-DB nicht öffnen: "+error)}).then(() => {
                        
                        Firebase.auth().signOut().then(function() {
                          //commit('setUser', null)
                          console.log('Signed Out')        
                        }, function(error) {
                          console.error('Sign Out Error', error)
                        });
                      
                    })
                  })
                  
                })
            })  
      })
    },
    
    registerUser ({commit}, payload) {
      Firebase.auth().signInAnonymously()
      .then(
          result => {
            
            //create Avatar
            var initials = payload.playerName.substr(0,1).toUpperCase()+payload.playerName.substr(-1).toUpperCase()
            var randomColor = require('randomcolor') // import the script
            var color = randomColor({luminosity: 'light'})
            
            const newUser = {
              id: result.user.uid,
              name: payload.playerName,
              activeGame: payload.gameID,
              initials,
              color
              //score: 0
            }
            console.log(result.user.uid)
            Firebase.database().ref('/users/' + newUser.id).set(newUser)
            commit('setUser', newUser)
          }
        )
      .catch(
        error => { console.log(error) }
        )
    },
    
    setUser(context, user){
      context.commit('setUser', user);
    },
    
    loaderOn({commit}){
      commit('setLoader', true)
    },
    
    loaderOff({commit}){
      commit('setLoader', false)
    }

  },
  getters: {

    // is there an active game ongoing?
    activeGame (state) {
      return (state.user != null && state.user.activeGame != '' && state.user.activeGame != null && state.user.activeGame != undefined)
    },
    
    // return user object
    user (state) {
      return state.user
    },
    
    // return user-id object
    userID (state) {
      if ((state.user != null) && (state.user != undefined))
        return state.user.id
      else
        return null
    },
    
    // return loader state
    loader (state) {
      return state.loader
    }
    
  }
}

// initialise Vuex
const store = new Vuex.Store(storeData)

// initFirebase
initFirebase()
  .catch(error => {
    // take user to a page stating an error occurred
    // (might be a connection error, or the app is open in another tab)
    console.log(error)
  })
  
//When ever the user authentication state changes write the user to vuex.
Firebase.auth().onAuthStateChanged((user) =>{
  if(user){
      console.log('auth()-StateChanged FIRED!! UID: '+user.uid)
      Firebase.database().ref('/users/' + user.uid).on('value', function(snapshot) {
        console.log(snapshot.val())
        store.dispatch('setUser', snapshot.val()).then(()=>{
          
          if( store.getters.user!=null && ("activeGame" in store.getters.user) && store.getters.user.activeGame ){
            
            try {
              //open connection do game-specific players....
              store.dispatch('players/openDBChannel',{gameID: store.getters.user.activeGame})
            } catch (e) {
              if (e.includes('openDBChannel was already called')) {
                return // do nothing because this listener is already open
              }
              // alert the user when another problem occurred. Maybe an internet failure etc.?
              alert(`something went wrong. (${e})`)
            }
            
            try {
              //...and bets overview
              store.dispatch('bets/openDBChannel',{gameID: store.getters.user.activeGame}) 
            } catch (e) {
              if (e.includes('openDBChannel was already called')) {
                return // do nothing because this listener is already open
              }
              // alert the user when another problem occurred. Maybe an internet failure etc.?
              alert(`something went wrong. (${e})`)
            }
            
            
          }else{
            try {
              store.dispatch('games/openDBChannel',{where: [['active','==',true]]})  
            } catch (e) {
              if (e.includes('openDBChannel was already called')) {
                return // do nothing because this listener is already open
              }
              // alert the user when another problem occurred. Maybe an internet failure etc.?
              alert(`something went wrong. (${e})`)
            }
            
          }
        })
      })
      
  }else{
      store.dispatch('setUser', null);
  }
});

export default store
  

