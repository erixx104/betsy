
'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');

const _ = require('lodash');

admin.initializeApp();



exports.resolveBet = functions.region('europe-west1')
    .firestore.document('/games/{gameId}/bets/{betId}').onWrite((snap, context) => {
      
      // ---- if BET was just created (no BEFORE exists) --> Stop here -> return
      if(!snap.before.exists)
        return true
      
      // ---- if it was an alive ping (to keep the function hot)  
      if(snap.before.data().alive_ping!=snap.after.data().alive_ping){
        console.log("alive ping")
        // don't return here, because it might be combined with some other event (eg verdict-change)
      }
      
      // ---------------------------- BET-Spectation when switching from "request" to "declined": transfer back scores   ------------- //
      if(snap.before.data().state === "requested" && snap.after.data().state === "declined"){

        console.log("bet was not accepted (declined) - scores will be transferred back")

        // transfer back game score corresponding to "pts"-Value
        for (let [key, value] of Object.entries(snap.after.data().selection)) { //loop through all participating players
          admin.firestore().collection('games').doc(context.params.gameId)
                           .collection('players').doc(key)
                              .update({"score" : admin.firestore.FieldValue.increment(snap.after.data().pts)})  
        }
          
          
        return true

      }
      
      
      // ---------------------------- BET-Spectation when switching from "request" to "running": same selections? stop bet   ------------- //
      // ------------> Adapted from transition to just "if state running" -> otherwise timing race condition between multiple players
      if(snap.after.data().state === "running"){
        let selections=Object.values(snap.after.data().selection)
        
        console.log(selections)
        console.log("Different selections: "+_.uniq(selections).length)
        
        // if there are no different selections (all picked the same -> transfer back score and stop bet -> State = "agreed")
        if(_.uniq(selections).length === 1){
          
          console.log("transfer Back")
          // transfer back game score corresponding to "pts"-Value
          for (let [key, value] of Object.entries(snap.after.data().selection)) { //loop through all participating players
            admin.firestore().collection('games').doc(context.params.gameId)
                             .collection('players').doc(key)
                                .update({"score" : admin.firestore.FieldValue.increment(snap.after.data().pts)})  
          }
          
          
          //write WinnerObj & set State
          snap.after.ref.set({
              state: 'agreed',
            }, {merge: true})
            
          return true
        }
      }
        

      // ---------------------------- BET-Spectation while "running": is bet sufficiently resolved??       ------------- //
      if(snap.after.data().state === "running"){

        const minEqualVerdicts = Math.ceil(Object.keys(snap.after.data().selection).length*0.51)
        console.log("minEqualVerdicts: "+minEqualVerdicts)
        
        let result = null
        let winner = null
        
        // if there are already any verdicts...
        if("verdict" in snap.after.data()){
            let verdicts  = _.invertBy(Object.assign({}, snap.after.data().verdict))
            let selection = _.invertBy(Object.assign({}, snap.after.data().selection))
            
            console.log(verdicts)

            // is there any verdict, which occurs the minimal amount of times? (minEqualVerdicts) -> store result and winner
            for (let [key, value] of Object.entries(verdicts)) {
              if(value.length>=minEqualVerdicts){
                  result = key
                  winner = selection[key]
              }
            }
            
            // if there is a result (= a winner-answer) ...
            if(result){
                console.log('Majority-vote: '+result)
                console.log('Winner: '+winner)
                
                //if there is one or more players, which selected the winner-answer...
                if(winner!==undefined && winner.length>=1){
                
                    // calculate overall Pot (#better * pts)
                    let potSize = Object.keys(snap.after.data().selection).length * snap.after.data().pts
                    console.log('Overall pot: '+potSize)
                    
                    console.log('Number of winner: '+ winner.length + ' - Win per winner: ' + potSize/winner.length)
                    
                    // calculate sum of winner wager
                    //let winnerWager = Object.values(_.pick(snap.after.data().wager, winner)).reduce((a, b) => a + b)
                    
                    //.log('Winner wager: '+winnerWager)
                    
                    // create winner object, by filtering wager to only winner and then calculate the win
                    // let winnerObj = _.mapValues(_.pick(snap.after.data().wager,winner), (o) => Math.ceil(o/winnerWager*potSize) )
                    
                    // console.log( winnerObj )
                    
                    //write WinnerObj & set State
                    snap.after.ref.set({
                        winnerAnswer: result,
                        winner: winner,
                        state: 'winner',
                      }, {merge: true})
                      
                    // recalculate game-scores corresponding to winnerObj
                    for (let key of winner) {
                      admin.firestore().collection('games').doc(context.params.gameId)
                                       .collection('players').doc(key)
                                          .update({"score" : admin.firestore.FieldValue.increment(potSize/winner.length)})  
                    }
                }else{
                    // if no player picked the winner-answer
                    
                    //write WinnerObj & set State
                    snap.after.ref.set({
                        winnerAnswer: result,
                        state: 'noWinner',
                      }, {merge: true})
                      
                    // transfer back game score corresponding to "pts"-value
                    for (let [key, value] of Object.entries(snap.after.data().selection)) {
                      admin.firestore().collection('games').doc(context.params.gameId)
                                       .collection('players').doc(key)
                                          .update({"score" : admin.firestore.FieldValue.increment(snap.after.data().pts)})  
                    }
                }
                
                
            }else
                console.log('no majority vote yet..')
        }
        
      }else{
        console.log("no active bet changed")
      }

      return true

    });
