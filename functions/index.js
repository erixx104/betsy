
'use strict';

// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
// [END import]



// [START makeUppercase]
// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
// [START makeUppercaseTrigger]
exports.resolveBet = functions.firestore.document('/games/{gameId}/bets/{betId}')
    .onWrite((snap, context) => {
// [END makeUppercaseTrigger]
      // [START makeUppercaseBody]
      // Grab the current value of what was written to the Cloud Firestore.
      
      console.log(context.params.gameId, context.params.betId);
      console.log(snap.after.data())
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Cloud Firestore.
      // Setting an 'uppercase' field in the Cloud Firestore document returns a Promise.
      return true // snap.ref.set({uppercase}, {merge: true});
      // [END makeUppercaseBody]
    });
// [END makeUppercase]
// [END all]