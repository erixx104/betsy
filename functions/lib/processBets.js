const functions = require('firebase-functions');
const admin = require('firebase-admin');
const _ = require('lodash');


exports.processBets = functions.region('europe-west1')
                    .firestore.document('/games/{gameId}/bets/{betId}')
                    .onWrite((snap, context) => {
          

    // ---- if BET was just created (no BEFORE exists) --> Stop here -> return
    if(!snap.before.exists){
        console.log("PB: New Bet created")
        return true
    }

    // ---- if it was an alive ping (to keep the function hot)  
    if(snap.before.data().alive_ping!==undefined && snap.before.data().alive_ping!==snap.after.data().alive_ping){
        console.log("PB: Alive ping")
    }

    // ----- if alivePing was created -> bet is older than request stage -> verify which state to transist to...
    if(snap.after.data().alive_ping!==undefined && snap.after.data().alive_ping>=40 && snap.after.data().state === "requested"){
        console.log("PB: First alive ping. Age: "+snap.after.data().alive_ping)
        
        // No selection --> DECLINE
        if(!("selection" in snap.after.data())){
            console.log("PB: Keiner hat geboten >> DECLINED")
            snap.after.ref.set({state: 'declined'}, {merge: true})
            //Transfer back Pts
            for (let [key, value] of Object.entries(snap.after.data().selection)) { //loop through all participating players
                admin.firestore().collection('games').doc(context.params.gameId)
                                 .collection('players').doc(key)
                                    .update({"score" : admin.firestore.FieldValue.increment(snap.after.data().pts)})  
            }

        // There is a selection...
        }else{

            // But only on selection --> Decline
            if(Object.keys(snap.after.data().selection).length<2){
                console.log("PB: Nur EINER hat geboten >> DECLINED")
                snap.after.ref.set({state: 'declined'}, {merge: true})
                //Transfer back Pts
                for (let [key, value] of Object.entries(snap.after.data().selection)) { //loop through all participating players
                    admin.firestore().collection('games').doc(context.params.gameId)
                                    .collection('players').doc(key)
                                        .update({"score" : admin.firestore.FieldValue.increment(snap.after.data().pts)})  
                }

            // There is more than one selection...
            }else{
                console.log("PB: Mindestens 2 haben geboten >> alle das Gleiche oder verschiedene Antworten?")

                let selections=Object.values(snap.after.data().selection)

                // ... but all picked the same --> Agreed
                if(_.uniq(selections).length === 1){
          
                    console.log("Alle das Gleiche gewählt >> AGREED")
                    snap.after.ref.set({state: 'agreed'}, {merge: true})
                    // transfer back game score corresponding to "pts"-Value
                    for (let [key, value] of Object.entries(snap.after.data().selection)) { //loop through all participating players
                      admin.firestore().collection('games').doc(context.params.gameId)
                                       .collection('players').doc(key)
                                          .update({"score" : admin.firestore.FieldValue.increment(snap.after.data().pts)})  
                    }

                // ... different answeres selected --> Running
                }else{
                    console.log("Verschiedene Antworten gewählt >> RUNNING")    
                    snap.after.ref.set({state: 'running'}, {merge: true})
                }

                
            }
        }
    }

    // ---------------------------- BET-Spectation while "running": was there a verdict change and is bet sufficiently resolved??       ------------- //
    if(snap.after.data().state === "running" && !_.isEqual(snap.before.data().verdict, snap.after.data().verdict)){
        console.log("PB: Verdict changed for active bet")

        const minEqualVerdicts = Math.ceil(Object.keys(snap.after.data().selection).length*0.51)
        console.log("PB: minEqualVerdicts: "+minEqualVerdicts)
        
        let result = null
        let winner = null
        
        // if there are already any verdicts...
        if("verdict" in snap.after.data()){
            let verdicts  = _.invertBy(Object.assign({}, snap.after.data().verdict))
            let selection = _.invertBy(Object.assign({}, snap.after.data().selection))

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

                    console.log('PB: WINNER!! Overall pot: '+potSize+' | Number of winner: '+ winner.length + ' | Win per winner: ' + potSize/winner.length)
                    snap.after.ref.set({winnerAnswer: result,winner: winner,state: 'winner'}, {merge: true})
                    // recalculate game-scores corresponding to winnerObj
                    for (let key of winner) {
                      admin.firestore().collection('games').doc(context.params.gameId)
                                       .collection('players').doc(key)
                                          .update({"score" : admin.firestore.FieldValue.increment(potSize/winner.length)})  
                    }
                }else{
                    // if no player picked the winner-answer
                    console.log('PB: noWINNER!! All wrong..')
                    snap.after.ref.set({winnerAnswer: result,state: 'noWinner'}, {merge: true})
                    // transfer back game score corresponding to "pts"-value
                    for (let [key, value] of Object.entries(snap.after.data().selection)) {
                      admin.firestore().collection('games').doc(context.params.gameId)
                                       .collection('players').doc(key)
                                          .update({"score" : admin.firestore.FieldValue.increment(snap.after.data().pts)})  
                    }
                }
                
                
            }else
                console.log('PB: no majority vote yet..')
        }else
            console.log('PB: That should not happen.. No verdict at all, but a verdict changed... confusing..')
    }

    return true

})