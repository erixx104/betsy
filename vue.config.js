module.exports = {
  devServer: {
    host: 'localhost',
    port: 8080,
    disableHostCheck: true
  },
}

// firebase deploy --only functions:resolveBet

// npm run build && firebase deploy

// npm run serve

// firebase emulators:start --only functions
// firebase init
// firebase emulators:start