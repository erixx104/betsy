
'use strict';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Cloud Firestore.
const admin = require('firebase-admin');

const _ = require('lodash');

admin.initializeApp();

module.exports = {
  //...require("./lib/resolveBet.js"),
  ...require("./lib/processBets.js"),
}



