module.exports = {
  devServer: {
    host: 'ec2-34-251-208-160.eu-west-1.compute.amazonaws.com',
    port: 8080,
    disableHostCheck: true
  },
}

// firebase deploy --only functions:resolveBet

// npm run build && firebase deploy

// npm run serve