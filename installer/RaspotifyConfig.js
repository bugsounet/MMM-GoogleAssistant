const path = require("path")
const fs = require("fs")
const util = require("util")
const exec = util.promisify(require("child_process").exec)
const readline = require("readline")
const systemd= require("@bugsounet/systemd")

var SpotifyDeviceName = "MagicMirror"
var SpotifyEmail = null
var SpotifyPassword = null
var RaspotifyAudioOutput= 999
var RaspotifyInitialVolume= 90

function checkConfig() {
  console.log("Read config.js and check MMM-GoogleAssistant module Configuration...\n")
  let file = path.resolve(__dirname, "../../../config/config.js")
  if (fs.existsSync(file)) MMConfig = require(file)
  else return console.error("config.js not found !")
  let GAModule = MMConfig.modules.find(m => m.module == "MMM-GoogleAssistant")

  if (!GAModule) {
    console.error("Fatal: MMM-GoogleAssistant configuration not found in config.js !")
    return process.exit(1)
  }

  if (!GAModule.config.Extented) {
    console.log("Fatal: Extented display is not defined in config.js (Extented: [])")
    return process.exit(1)
  }

  if (!GAModule.config.Extented.useEXT) console.log("Warning: Extented display is not activated in config.js (useEXT)")

  if (!GAModule.config.Extented.spotify) {
    console.log("Fatal: spotify is not defined in config.js (spotify:{})")
    return process.exit(1)
  }

  if (!GAModule.config.Extented.spotify.useSpotify) console.log("Warning: Spotify is not enabled. (useSpotify)")

  if (!GAModule.config.Extented.spotify.player) {
    console.log("Warning: player feature of Spotify module is not defined. (player:{})")
    return process.exit(1)
  }

  if (!GAModule.config.Extented.deviceName) console.log("Warning: Spotify devicename not found! (deviceName) using default name:", SpotifyDeviceName)
  else SpotifyDeviceName= GAModule.config.Extented.deviceName

  if (!GAModule.config.Extented.spotify.player.email) {
    console.log("Fatal: email field needed in player feature of spotify module")
    return process.exit(1)
  }

  if (!GAModule.config.Extented.spotify.player.password) {
    console.log("Fatal: password field needed in player feature of spotify module")
    return process.exit(1)
  }

  if (!GAModule.config.Extented.spotify.player.maxVolume) console.log("Warning: maxVolume field is not defined in player feature of spotify module (maxVolume) using default value:", RaspotifyInitialVolume)
  else RaspotifyInitialVolume = GAModule.config.Extented.spotify.player.maxVolume

  console.log("Info: deviceName found:", SpotifyDeviceName)
  console.log("Info: Initial Volume:", RaspotifyInitialVolume)
  SpotifyEmail = GAModule.config.Extented.spotify.player.email
  SpotifyPassword = GAModule.config.Extented.spotify.player.password
  console.log("Info: Email found:", SpotifyEmail)
  console.log("Info: Password found:", "******")
}

async function defineAudioOutput() {
  console.log("\nChoose your audio card ?\n")
  console.log("Choose 999 for default card")
  console.log("Warning: if pulse audio is enabled, default card will not works\n")
  const { stdout, stderr } = await exec("aplay -l")
  console.log(stdout)

  var rl = readline.createInterface(process.stdin, process.stdout)
  rl.setPrompt('Your choice: ')
  rl.prompt()
  for await (const line of rl) {
    var response = line.trim()
    if (response && !isNaN(response) && (response >= 0 || response <= 999)) {
      console.log("Right! Your choice is:", response, "\n")
      RaspotifyAudioOutput= response
      rl.close()
    }
    else rl.prompt()
  }
}

async function createConfig() {
  // before overwrite config... let's check if raspotify is installed
  const Systemd = new systemd("raspotify")
  const RaspotifyStatus = await Systemd.status()
  if (RaspotifyStatus.error) {
    console.error("[RASPOTIFY] Error: Raspotify is not installed!")
    return process.exit(1)
  }

  if (RaspotifyAudioOutput == 999) {

    var RaspotifyConfig = `
# /etc/default/raspotify -- Arguments/configuration for librespot
DEVICE_NAME="${SpotifyDeviceName}"
BITRATE="160"
OPTIONS="--username ${SpotifyEmail} --password ${SpotifyPassword}"
VOLUME_ARGS="--enable-volume-normalisation --volume-ctrl linear --initial-volume=${RaspotifyInitialVolume}"
BACKEND_ARGS="--backend alsa"
DEVICE_TYPE="speaker"
`

  } else {

    var RaspotifyConfig = `
# /etc/default/raspotify -- Arguments/configuration for librespot
DEVICE_NAME="${SpotifyDeviceName}"
BITRATE="160"
OPTIONS="--username ${SpotifyEmail} --password ${SpotifyPassword} --device=hw:${RaspotifyAudioOutput},0"
VOLUME_ARGS="--enable-volume-normalisation --volume-ctrl linear --initial-volume=${RaspotifyInitialVolume}"
BACKEND_ARGS="--backend alsa"
DEVICE_TYPE="speaker"
`
  }

  // push new config
  fs.writeFile("/etc/default/raspotify", RaspotifyConfig, async (err, data) => {
    if (err) {
      console.log("[RASPOTIFY] Error:", err.message)
      return process.exit(1)
    }
    // apply new config and restart raspotify
    console.log("[RASPOTIFY] Restart Raspotify with new configuration.")
    const RaspotifyRestart = await Systemd.restart()
    if (RaspotifyRestart.error) {
      console.log("[RASPOTIFY] Error when restart Raspotify!")
      return process.exit(1)
    }
    console.log("[RASPOTIFY] Done.")
  })
}

async function main() {
  await checkConfig()
  await defineAudioOutput()
  await createConfig()
}

main()
