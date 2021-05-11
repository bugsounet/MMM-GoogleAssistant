'use strict'
const GP = require("@bugsounet/google-photos")
const path = require('path')
const authOption = {
  keyFilePath: path.resolve(__dirname, '../credentials.json'),
  savedTokensPath: path.resolve(__dirname, '../tokens/tokenGP.json'),
  scope: "https://www.googleapis.com/auth/photoslibrary https://www.googleapis.com/auth/photoslibrary.sharing"
}

var GPhotos = new GP({
  authOption: authOption,
  debug: true
})

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
