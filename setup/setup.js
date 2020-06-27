const path = require("path")
const fs = require("fs")

/** default module config **/
var defaultModule = {
  debug:false,
  assistantConfig: {
    lang: "en-US",
    credentialPath: "credentials.json",
    tokenPath: "token.json",
    projectId: "",
    modelId: "",
    instanceId: "",
    latitude: 51.508530,
    longitude: -0.076132,
  },
  responseConfig: {
    useScreenOutput: true,
    screenOutputCSS: "screen_output.css",
    screenOutputTimer: 5000,
    activateDelay: 250,
    useAudioOutput: true,
    useChime: true,
    newChime: false
  },
  micConfig: {
    recorder: "arecord",
    device: null,
  },
  customActionConfig: {
    autoMakeAction: false,
    autoUpdateAction: false,
    // actionLocale: "en-US", // multi language action is not supported yet
  },
  snowboy: {
    audioGain: 2.0,
    Frontend: true,
    Model: "jarvis",
    Sensitivity: null
  },
  A2DServer: {
    useA2D: false,
    stopCommand: "stop"
  },
  recipes: [],
}

/** Merge function **/
function mergeConfig(result) {
  var stack = Array.prototype.slice.call(arguments, 1)
  var item
  var key
  while (stack.length) {
    item = stack.shift()
    for (key in item) {
      if (item.hasOwnProperty(key)) {
        if (
          typeof result[key] === "object" && result[key]
          && Object.prototype.toString.call(result[key]) !== "[object Array]"
        ) {
          if (typeof item[key] === "object" && item[key] !== null) {
            result[key] = mergeConfig({}, result[key], item[key])
          } else {
            result[key] = item[key]
          }
        } else {
          result[key] = item[key]
        }
      }
    }
  }
  return result
}

/** Read MagicMirror Config **/
function readConfig() {
  let file = path.resolve(__dirname, "../../../config/config.js")
  if (fs.existsSync(file)) {
    var MMConfig = require(file)
  }
  else return console.log("config.js not found !?")
  return MMConfig
}

/** Read wanted config module **/
function readModules(config, module) {
  if (!module) return console.log("no module specified")
  try {
   var configModule = config.modules.find(m => m.module == module)
   configModule.config = mergeConfig( {} , defaultModule, configModule.config )
  } catch (e) {
    console.log("Error: " + e)
  }
  if (!configModule) return console.log("module not found!")
  return configModule
}

var MMConfig = readConfig()
var configAssistant = readModules(MMConfig, "MMM-GoogleAssistant")
if (!configAssistant) return
console.log("Config Found: ", configAssistant.module)

/***/
var express = require('express');
var app = express();

app.use(express.static('public'));
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/index.htm")
})

app.get("/config", (req, res) => {
   res.json(configAssistant)
   console.log("send config")
})

app.get('/process_get', (req, res) => {
   response = {
      var1:req.query.var1,
      var2:req.query.var2
   };
   console.log(response)
   configAssistant.config = mergeConfig( {} , configAssistant.config, response )
   console.log ("new config", configAssistant)
   res.end("Ok!")
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Running config app")
})
