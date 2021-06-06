'use strict'
const GP = require("@bugsounet/google-photos")
const path = require('path')
const authOption = {
  CREDENTIALS: path.resolve(__dirname, '../credentials.json'),
  TOKEN: path.resolve(__dirname, '../tokens/tokenGP.json')
}

var GPhotos = new GP(authOption, true)

GPhotos.generateToken(
  function success () {
    console.log ("TokenGP is generated.")
    process.exit()
  },
  function fail() {
    console.log("TokenGP file doesn't exist. Check the permission.")
    process.exit()
  }
)
