/** Spotify setup **/
/** @bugsounet **/

const fs = require("fs")
const path = require("path")
const Spotify = require("@bugsounet/spotify")

let file = path.resolve(__dirname, "../../../config/config.js")
let found = false
let config = {}

if (fs.existsSync(file)) {
  var MMConfig = require(file)
  var MMModules = MMConfig.modules
}
else return console.log("config.js not found !?")

for (let [nb, module] of Object.entries(MMModules)) {
  if (module.module == "MMM-GoogleAssistant") {
    found = true
    if (!module.config.Extented.spotify || !module.config.Extented) return console.log("Extented Spotify module not configured in config.js")
    if (!module.config.Extented.spotify.CLIENT_SECRET) return console.log("CLIENT_SECRET is not defined in spotify module !")
    if (!module.config.Extented.spotify.CLIENT_ID) return console.log("CLIENT_ID is not defined in spotify module !")
    /** All is Good ! **/
    config.TOKEN = "./tokenSpotify.json"
    config.CLIENT_SECRET = module.config.Extented.spotify.CLIENT_SECRET
    config.CLIENT_ID = module.config.Extented.spotify.CLIENT_ID
    config.PATH = "../../../tokens/"
  }
}
if (!found) return console.log("MMM-GoogleAssistant not configured in config.js")

let Auth = new Spotify(config, null, true, true)
Auth.authFlow(() => {
  console.log("[SPOTIFY_AUTH] Authorization is finished. Check ", config.TOKEN)
}, (e) => {
  console.log(e)
})

