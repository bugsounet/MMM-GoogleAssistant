"use strict"

/** parse data from MagicMirror **/
var _load = require("../components/loadLibraries.js")
const fs = require("fs")

async function init(that) {
  that.lib = { error: 0 }
  that.config = {}
  that.MMVersion = global.version
  that.root_path = global.root_path
  that.alreadyInitialized = false
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
  await that.lib.GATools.check(that)
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

  that.searchOnGoogle = new that.lib.googleSearch()
  
  let WebsiteHelperConfig = {
    config: that.config.website,
    debug:that.config.debug,
    assistantLang: that.config.assistantConfig.lang,
    lib: that.lib
  }
  that.website = new that.lib.website(WebsiteHelperConfig, (...args) => that.sendSocketNotification(...args))

  that.lib.GATools.loadRecipes(that, ()=> {
    console.log("[GA] Recipes loaded!")
    that.sendSocketNotification("PRE-INIT")
  })
}

function error(that, err, error, details = null) {
  if (details) console.log("[GA] [DATA] [ERROR]" + err, details.message, details)
  else console.log("[GA] [DATA] [ERROR]" + err)
  return that.sendSocketNotification("NOT_INITIALIZED", { message: error.message, values: error.values })
}

exports.init = init
exports.parse = parse
exports.error = error
