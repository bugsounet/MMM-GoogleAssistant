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
/** response received translate **/
var response = {
  module: "MMM-Google-Assistant",
  position: req.query.position,
  config: {
    debug: stringToBool(req.query.debug),
    assistantConfig: {
      lang: req.query.lang,
      credentialPath: req.query.credentials,
      tokenPath: req.query.token,
      projectId: req.query.projectId,
      modelId: req.query.modelId,
      instanceId: req.query.instanceId,
      latitude: Number(req.query.latitude),
      longitude: Number(req.query.longitude),
    },
    responseConfig: {
      useScreenOutput: stringToBool(req.query.useScreenOutput),
      screenOutputCSS: req.query.screenOutputCSS,
      screenOutputTimer: Number(req.query.screenOutputTimer),
      activateDelay: Number(req.query.activateDelay),
      useAudioOutput: stringToBool(req.query.useAudioOutput),
      useChime: stringToBool(req.query.useChime),
      newChime: stringToBool(req.query.newChime)
    },
    micConfig: {
      recorder: req.query.recorder,
      device: req.query.device
    },
    customActionConfig: {
      autoMakeAction: stringToBool(req.query.autoMakeAction),
      autoUpdateAction: stringToBool(req.query.autoUpdateAction),
      //actionLocale: "en-US", // multi language action is not supported yet
    },
    snowboy: {
      audioGain: Number(req.query.audioGain),
      Frontend: stringToBool(req.query.Frontend),
      Model: req.query.Model,
      Sensitivity: Number(req.query.Sensitivity)
    },
    A2DServer: {
      useA2D: stringToBool(req.query.useA2D),
      stopCommand: req.query.stopCommand
    },
    recipes: stringToArray(req.query.recipes),
  }
}
   configAssistant = mergeConfig( {} , configAssistant, response )
   console.log (configAssistant)
   res.end("Ok!")
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Running configuration app on port", port)
})

/***********/
/** UTILS **/
/***********/

/** convert string to boolean **/
function stringToBool(string) {
  switch(string.toLowerCase().trim())
  {
    case true:
    case "true":
    case "yes":
    case 1:
      return true;
    case false:
    case "false":
    case "no":
    case 0:
    case null:
      return false;
    default:
      return false;
  }
}

/** convert string to Array **/
function stringToArray(string) {
  if (string) return string.split(',')
  else return []
}
