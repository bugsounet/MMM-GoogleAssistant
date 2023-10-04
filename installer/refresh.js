var Spinner = require('cli-spinner').Spinner;
const path = require("path")
const { spawn } = require("child_process")
const pressAnyKey = require('press-any-key');
const { readdirSync } = require ('fs')
const resolved = path.resolve(__dirname, "../..")
const Directories = getDirectories(resolved)


const db = [
  "MMM-GoogleAssistant",
  "Gateway",
  "EXT-Alert",
  "EXT-Background",
  "EXT-Bard",
  "EXT-Bring",
  "EXT-Browser",
  "EXT-Detector",
  "EXT-FreeboxTV",
  "EXT-GooglePhotos",
  "EXT-Governor",
  "EXT-Internet",
  "EXT-Keyboard",
  "EXT-Librespot",
  "EXT-MusicPlayer",
  "EXT-Motion",
  "EXT-Pages",
  "EXT-Photos",
  "EXT-Pir",
  "EXT-RadioPlayer",
  "EXT-Screen",
  "EXT-Selfies",
  "EXT-SelfiesFlash",
  "EXT-SelfiesSender",
  "EXT-SelfiesViewer",
  "EXT-Spotify",
  "EXT-SpotifyCanvasLyrics",
  "EXT-StreamDeck",
  "EXT-TelegramBot",
  "EXT-Updates",
  "EXT-Volume",
  "EXT-Welcome",
  "EXT-YouTube",
  "EXT-YouTubeCast"
]

console.log("Start Refreshing MMM-GoogleAssistant; Gateway and EXTs\n")
main()

function getDirectories(source) {
  const directories = readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  return directories
}

function Update(module) {
  return new Promise(resolve => {
    console.log("Found:", module)
    const modulePath = resolved + "/" + module
    var command = "npm run clean && npm run update"

    const spinner = new Spinner(`Updating: ${module}...`);
    spinner.setSpinnerString(18);
    spinner.start()
    const updateModule = spawn(command, { cwd: modulePath, shell: true })
    
    updateModule.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    updateModule.on('exit', (code) => {
      spinner.stop()
      process.stdout.write('\r');
      if (!code) {
        let version = require(modulePath + "/package.json").version
        let rev = require(modulePath + "/package.json").rev
        console.log(`✓ Update of ${module}: Version: ${version} (${rev})`)
        console.log("---")
        resolve()
      } else {
        console.error("Error Detected!")
        pressAnyKey("Press any key to continue, or CTRL+C to exit", {
          ctrlC: "reject"
        })
          .then(() => {
            console.log("---")
            resolve()
          })
          .catch(() => {
            process.exit()
          })
      }
    });

  })
}

async function main () {
  for (const module of Directories) {
    if (db.indexOf(module) !== -1) {
      await Update(module)
    }
    else {
      console.log("Skip:", module)
      console.log("---")
    }
  }
}
