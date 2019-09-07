
'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');

const _ = require('lodash');

admin.initializeApp();



exports.resolveBet = functions.firestore.document('/games/{gameId}/bets/{betId}')
    .onWrite((snap, context) => {
      
      // ---- if BET was just created (no BEFORE exists) --> Stop here -> return
      if(!snap.before.exists)
        return true
      
      // ---------------------------- BET-Spectation when switching from "request" to "declined": transfer back scores   ------------- //
      if(snap.before.data().state === "requested" && snap.after.data().state === "declined"){

        console.log("bet was not accepted (declined) - scores will be transferred back")

        // transfer back game score corresponding to "wager"-Object
        for (let [key, value] of Object.entries(snap.after.data().wager)) {
          admin.firestore().collection('games').doc(context.params.gameId)
                           .collection('players').doc(key)
                              .update({"score" : admin.firestore.FieldValue.increment(value)})  
        }
          
          
        return true

      }
      
      
      // ---------------------------- BET-Spectation when switching from "request" to "running": same selections? stop bet   ------------- //
      if(snap.before.data().state === "requested" && snap.after.data().state === "running"){
        let selections=Object.values(snap.after.data().selection)
        
        console.log(selections)
        console.log("Different selections: "+_.uniq(selections).length)
        
        // if there are no different selections (all picked the same -> transfer back score and stop bet -> State = "agreed")
        if(_.uniq(selections).length === 1){
          
          // transfer back game score corresponding to "wager"-Object
          for (let [key, value] of Object.entries(snap.after.data().wager)) {
            admin.firestore().collection('games').doc(context.params.gameId)
                             .collection('players').doc(key)
                                .update({"score" : admin.firestore.FieldValue.increment(value)})  
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
            
            console.log(selection)

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
                if(winner.length>=1){
                
                    // calculate overall Pot (sum of all wagers)
                    let potSize = Object.values(snap.after.data().wager).reduce((a, b) => a + b);
                    console.log('Overall pot: '+potSize)
                    
                    // calculate sum of winner wager
                    let winnerWager = Object.values(_.pick(snap.after.data().wager, winner)).reduce((a, b) => a + b)
                    
                    console.log('Winner wager: '+winnerWager)
                    
                    // create winner object, by filtering wager to only winner and then calculate the win
                    let winnerObj = _.mapValues(_.pick(snap.after.data().wager,winner), (o) => Math.ceil(o/winnerWager*potSize) )
                    
                    console.log( winnerObj )
                    
                    //write WinnerObj & set State
                    snap.after.ref.set({
                        winnerAnswer: result,
                        winner: winnerObj,
                        state: 'winner',
                      }, {merge: true})
                      
                    // recalculate game-scores corresponding to winnerObj
                    for (let [key, value] of Object.entries(winnerObj)) {
                      admin.firestore().collection('games').doc(context.params.gameId)
                                       .collection('players').doc(key)
                                          .update({"score" : admin.firestore.FieldValue.increment(value)})  
                    }
                }else{
                    // if no player picked the winner-answer
                    
                    //write WinnerObj & set State
                    snap.after.ref.set({
                        winnerAnswer: result,
                        state: 'noWinner',
                      }, {merge: true})
                      
                    // transfer back game score corresponding to "wager"-Object
                    for (let [key, value] of Object.entries(snap.after.data().wager)) {
                      admin.firestore().collection('games').doc(context.params.gameId)
                                       .collection('players').doc(key)
                                          .update({"score" : admin.firestore.FieldValue.increment(value)})  
                    }
                }
                
                
            }else
                console.log('no majority vote yet..')
        }
        
      }else{
        console.log("no active bet changed")
      }

      return true // snap.ref.set({uppercase}, {merge: true});

    });
