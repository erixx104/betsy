// ~config/firebase.js
import * as Firebase from 'firebase' //'firebase/app'
import 'firebase/firestore'

function initFirebase () {
  Firebase.initializeApp({ 
      apiKey: "AIzaSyCFg-7IkXZmakFDniHFwgpZEwxn0t5Uz2Q",
      authDomain: "betsy-14cf1.firebaseapp.com",
      databaseURL: "https://betsy-14cf1.firebaseio.com",
      projectId: "betsy-14cf1",
      //storageBucket: "",
      //messagingSenderId: "53420329992",
      appId: "1:53420329992:web:86b65cbedb538492"      
    })
    

    
  return new Promise((resolve, reject) => {
    Firebase.firestore().enablePersistence()
      .then(resolve)
      .catch(err => {
        if (err.code === 'failed-precondition') {
          reject(err)
          // Multiple tabs open, persistence can only be
          // enabled in one tab at a a time.
        } else if (err.code === 'unimplemented') {
          reject(err)
          // The current browser does not support all of
          // the features required to enable persistence
        }
      })
  })
}

export { Firebase, initFirebase }