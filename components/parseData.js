"use strict"

/** parse data from MagicMirror **/
var _load = require("../components/loadLibraries.js")
const fs = require("fs")
const SystemInformation = require("../components/systemInformation.js")
const googleSearch = require("../components/googleSearch.js")
const activateAssistant = require("../components/activateAssistant.js")
const recipes = require("../components/recipes.js")
const configMerge = require( "../components/configMerge.js")
const shellExec = require("../components/shellExec.js")
const EXTTools = require("../components/EXT_Tools.js")
const SHTools = require("../components/SH_Tools.js")

async function init(that) {
  that.lib = { error: 0 }
  that.config = {}
  that.MMVersion = global.version
  that.root_path = global.root_path
  that.alreadyInitialized = false
  that.EXT = {
    MMConfig: null, // real config file (config.js)
    EXT: null, // EXT plugins list
    EXTDescription: {}, // description of EXT
    EXTConfigured: [], // configured EXT in config
    EXTInstalled: [], // installed EXT in MM
    EXTStatus: {}, // status of EXT
    user: { _id: 1, username: 'admin', password: 'admin' },
    initialized: false,
    app: null,
    server: null,
    translation: null,
    schemaTranslatation: null,
    language: null,
    webviewTag: false,
    GAConfig: {},
    HyperWatch: null,
    radio: null,
    freeteuse: {},
    systemInformation: {
      lib: null,
      result: {}
    },
    activeVersion: {},
    usePM2: false,
    PM2Process: 0,
    homeText: null,
    errorInit: false
  }
  that.SmartHome = {
    lang: "en",
    use: false,
    init: false,
    last_code: null,
    last_code_user: null,
    last_code_time: null,
    user: { user: "admin", password: "admin", devices: [ "MMM-GoogleAssistant" ] },
    actions: null,
    device: {},
    EXT: {},
    smarthome: {},
    oldSmartHome: {},
    homegraph: null
  }
}

async function parse(that) {
  let bugsounet = await _load.libraries(that)
  if (bugsounet) {
    console.error("[GA] [DATA] Warning:", bugsounet, "needed library not loaded !")
    console.error("[GA] [DATA] Try to solve it with `npm run rebuild` in MMM-GoogleAssistant folder")
    return
  }
  await configMerge.check(that)
  var error = null

  if (!fs.existsSync(that.config.assistantConfig["modulePath"] + "/credentials.json")) {
    error = "[FATAL] Assistant: credentials.json file not found !"
    return this.error(that, error, {message: "GAErrorCredentials"})
  }
  else if (!fs.existsSync(that.config.assistantConfig["modulePath"] + "/tokenGA.json")) {
    error = "[FATAL] Assistant: tokenGA.json file not found !"
    return this.error(that, error, {message: "GAErrorTokenGA"})
  }

  that.config.micConfig.recorder= "arecord"
  that.activateAssistant = activateAssistant
  that.shellExec = shellExec
  that.searchOnGoogle = new googleSearch()

  recipes.load(that, ()=> {
    console.log("[GA] Recipes loaded!")
    that.sendSocketNotification("PRE-INIT")
  })
}

async function parseMiddleware(that, data) {
  that.EXT.MMConfig = await EXTTools.readConfig(that)
  let Version = {
    version: require('../package.json').version,
    rev: require('../package.json').rev,
    lang: that.config.assistantConfig.lang
  }
  if (!that.EXT.MMConfig) {
    that.EXT.errorInit = true
    console.error("[GA] Error: MagicMirror config.js file not found!")
    that.sendSocketNotification("ERROR", "MagicMirror config.js file not found!")
    return
  }
  await EXTTools.MMConfigAddress(that)
  if (that.lib.error || that.EXT.errorInit) return

  that.EXT.language = that.EXT.MMConfig.language
  that.EXT.webviewTag = EXTTools.checkElectronOptions(that.EXT.MMConfig)
  that.EXT.EXT = data.DB.sort()
  that.EXT.EXTDescription = data.Description
  that.EXT.translation = data.Translate
  that.EXT.schemaTranslatation = data.Schema
  that.EXT.EXTStatus = data.EXTStatus
  that.EXT.GAConfig = EXTTools.getGAConfig(that.EXT.MMConfig)
  that.EXT.homeText = await EXTTools.getHomeText(that.lib, that.EXT.language)
  that.EXT.freeteuse = await EXTTools.readFreeteuseTV(that)
  that.EXT.radio= await EXTTools.readRadioRecipe(that)
  that.EXT.usePM2 = await EXTTools.check_PM2_Process(that)
  that.EXT.systemInformation.lib = new SystemInformation(that.lib, that.EXT.translation)
  that.EXT.systemInformation.result = await that.EXT.systemInformation.lib.initData()
  if (that.config.website.CLIENT_ID) {
    that.SmartHome.lang = SHTools.SHLanguage(that.EXT.language)
    that.SmartHome.use = true
    that.SmartHome.user.user = that.config.website.username
    that.SmartHome.user.password = that.config.website.password
    that.lib.homegraph.init(that)
    that.lib.Device.create(that)
  } else {
    console.log("[GA] no CLIENT_ID found in your config!")
    console.warn("[GA] SmartHome functionality is disabled")
  }

  that.lib.Middleware.initialize(that)
  if (that.config.website.CLIENT_ID) that.lib.SmartHome.initialize(that)
  else that.lib.SmartHome.disable(that)

  that.lib.Middleware.startServer(that, cb => {
    if (cb) {
      console.log("[GA] MMM-GoogleAssistant and Website Ready!")
      that.sendSocketNotification("INITIALIZED", Version)
    }
  })
}

function error(that, err, error, details = null) {
  if (details) console.log("[GA] [DATA] [ERROR]" + err, details.message, details)
  else console.log("[GA] [DATA] [ERROR]" + err)
  return that.sendSocketNotification("NOT_INITIALIZED", { message: error.message, values: error.values })
}

exports.init = init
exports.parse = parse
exports.parseMiddleware = parseMiddleware
exports.error = error
