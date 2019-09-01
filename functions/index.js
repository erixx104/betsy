
'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');

const _ = require('lodash');

admin.initializeApp();



exports.resolveBet = functions.firestore.document('/games/{gameId}/bets/{betId}')
    .onWrite((snap, context) => {
        
      //console.log(context.params.gameId, context.params.betId);
      //console.log(snap.after.data())
      
      if(snap.after.data().state === "running"){

        const minEqualVerdicts = Math.ceil(Object.keys(snap.after.data().selection).length*0.51)
        console.log("minEqualVerdicts: "+minEqualVerdicts)
        
        var result = null
        var winner = null
        
        // if there are already any verdicts...
        if("verdict" in snap.after.data()){
            var verdicts = _.invertBy(Object.assign({}, snap.after.data().verdict))


            // is there any verdict, which occurs the minimal amount of times? (minEqualVerdicts) -> store result and winner
            for (let [key, value] of Object.entries(verdicts)) {
              //console.log(`${key} :-> ${value.length}`);
              if(value.length>=minEqualVerdicts){
                  result = key
                  winner = value
              }
            }
            
            // if there is a result (= a winner) ...
            if(result){
                console.log('Majority-vote: '+result)
                console.log('Winner: '+winner)
                
                // calculate overall Pot (sum of all wagers)
                var potSize = Object.values(snap.after.data().wager).reduce((a, b) => a + b);
                console.log('Overall pot: '+potSize)
                
                // calculate sum of winner wager
                var winnerWager = Object.values(_.pick(snap.after.data().wager, winner)).reduce((a, b) => a + b)
                
                console.log('Winner wager: '+winnerWager)
                
                // create winner object, by filtering wager to only winner and then calculate the win
                var winnerObj = _.mapValues(_.pick(snap.after.data().wager,winner), (o) => Math.ceil(o/winnerWager*potSize) )
                
                console.log( winnerObj )
                
                //write WinnerObj & set State
                snap.after.ref.set({
                    winner: winnerObj,
                    state: 'over',
                  }, {merge: true})
                  
                // recalculate game-scores corresponding to winnerObj
                for (let [key, value] of Object.entries(winnerObj)) {
                  admin.firestore().collection('games').doc(context.params.gameId).collection('players').doc(key)
                    .update({"score" : admin.firestore.FieldValue.increment(value)})  
                }
                
                
            }else
                console.log('no majority vote yet..')
        }
        
      }else{
        console.log("no active bet changed")
      }

      return true // snap.ref.set({uppercase}, {merge: true});

    });
