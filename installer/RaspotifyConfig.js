const path = require("path")
const fs = require("fs")
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const readline = require('readline')

var SpotifyDeviceName = "MagicMirror"
var SpotifyEmail = null
var SpotifyPassword = null
var RaspotifyAudioOutput= 999

function checkConfig() {
  console.log("Read config.js and check MMM-GoogleAssistant module Configuration...\n")
  let file = path.resolve(__dirname, "../../../config/config.js")
  if (fs.existsSync(file)) MMConfig = require(file)
  else return console.error("config.js not found !")
  let GAModule = MMConfig.modules.find(m => m.module == "MMM-GoogleAssistant")
  console.log("Found MMM-GoogleAssistant Config:\n", GAModule,"\n")
  if (!GAModule) return console.error("MMM-GoogleAssistant configuration not found in config.js !")
  if (!GAModule.config.Extented) return console.log("Extented display is not defined in config.js (Extented: [])")
  if (!GAModule.config.Extented.useEXT) console.log("Extented display is not activated in config.js (useEXT)")
  if (!GAModule.config.Extented.spotify) return console.log("spotify is not defined in config.js (spotify:{})")
  if (!GAModule.config.Extented.spotify.useSpotify) console.log("Warning: Spotify is not enabled. (useSpotify)")
  if (!GAModule.config.Extented.spotify.player) return console.log("Warning: player feature of Spotify module is not defined. (player:{})")
  if (!GAModule.config.Extented.spotify.player.deviceName) console.log("Warning: Spotify devicename not found! (deviceName) using default name:", SpotifyDeviceName)
  if (!GAModule.config.Extented.spotify.player.email) return console.log("Warning: email field needed in player feature of spotify module")
  if (!GAModule.config.Extented.spotify.player.password) return console.log("Warning: password field needed in player feature of spotify module")
  else {
    SpotifyDeviceName = GAModule.config.Extented.spotify.player.deviceName
    console.log("Info: deviceName found:", SpotifyDeviceName)
    SpotifyEmail = GAModule.config.Extented.spotify.player.email
    SpotifyPassword = GAModule.config.Extented.spotify.player.password
    console.log("Info: Email found:", SpotifyDeviceName)
    console.log("Info: Password found:", "******")
  }
}

async function defineAudioOutput() {
  console.log("\nChoose your audio card ?\n")
  console.log("Choose 999 for default card")
  console.log("warning: if pulse audio is enabled, default card will not works\n")
  const { stdout, stderr } = await exec("aplay -l")
  console.log(stdout)

  var rl = readline.createInterface(process.stdin, process.stdout)
  rl.setPrompt('Your choice: ')
  rl.prompt()
  for await (const line of rl) {
    var response = line.trim()
    if (response && !isNaN(response) && (response >= 0 || response <= 999)) {
      console.log("Right! Your choice is:", response)
      RaspotifyAudioOutput= response
      rl.close()
    }
    else rl.prompt()
  }
}


async function createConfig() {
  if (RaspotifyAudioOutput == 999) {

    var RaspotifyConfig = `
# /etc/default/raspotify -- Arguments/configuration for librespot
DEVICE_NAME="${SpotifyDeviceName}"
BITRATE="160"
OPTIONS="--username ${SpotifyEmail} --password ${SpotifyPassword}"
VOLUME_ARGS="--enable-volume-normalisation --volume-ctrl linear --initial-volume=100"
BACKEND_ARGS="--backend alsa"
DEVICE_TYPE="speaker"
`

  } else {

    var RaspotifyConfig = `
# /etc/default/raspotify -- Arguments/configuration for librespot
DEVICE_NAME="${SpotifyDeviceName}"
BITRATE="160"
OPTIONS="--username ${SpotifyEmail} --password ${SpotifyPassword} --device=hw:${RaspotifyAudioOutput},0"
VOLUME_ARGS="--enable-volume-normalisation --volume-ctrl linear --initial-volume=100"
BACKEND_ARGS="--backend alsa"
DEVICE_TYPE="speaker"
`

  }

  console.log(RaspotifyConfig)
  console.log(`
  @todo:
  * maybe check initial volume from config ?
  * create the file
  * save it as the default config
  * check if raspotify installed
  * restart raspotify service
  `)
}

async function main() {
  await checkConfig()
  await defineAudioOutput()
  await createConfig()
}

main()
