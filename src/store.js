import Vue from 'vue'
import Vuex from 'vuex'
import VuexEasyFirestore from 'vuex-easy-firestore'
import { increment } from 'vuex-easy-firestore'
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

        //set 'activeGame' @ Player (in Games) to null to indicate, that the user actively left the game
        dispatch('players/patch', {id : state.user.id, activeGame : null })
                    .catch(console.error)
                    .then(() =>{
                      
                      //...then remove active user from Firebase DB
                      Firebase.database().ref('/users/' + state.user.id).remove().then(() => {
                          //...then signout
                          Firebase.auth().signOut().then(function() {
                              //commit('setUser', null)
                              console.log('Signed Out')        
                            }, function(error) {
                              console.error('Sign Out Error', error)
                            });
                      })
                    })
    },
    
    registerUser ({commit, dispatch}, payload) {
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

            dispatch('players/setPathVars',{gameID: payload.gameID})
            dispatch('players/insert', Object.assign(newUser, {score:10, last_online:Date.now()}) )

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
    },
    
    addUserScore({dispatch}, payload){
      dispatch('players/patch', {id: payload.user, score: increment(payload.score)})
    },

  },
  getters: {

    // is there an active game ongoing?
    activeGame (state) {
      if(state.user != null && state.user.activeGame != '' && state.user.activeGame != null && state.user.activeGame != undefined)
        return state.user.activeGame
      else
        return null
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
      console.log('auth()-State: UID='+user.uid)
      Firebase.database().ref('/users/' + user.uid).on('value', function(snapshot) {
        store.dispatch('setUser', snapshot.val())
      })
      
  }else{
      console.log('auth()-State: no User')
      store.dispatch('setUser', null);
  }
});

export default store
  

