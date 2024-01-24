"use strict"

/** parse data from MagicMirror **/
var _load = require("../components/loadLibraries.js")
const fs = require("fs")
const { exec } = require("child_process")

async function init(that) {
  that.lib = { error: 0 }
  that.config = {}
  that.alreadyInitialized = false
}

async function parse(that) {
  var msg = null
  var message = null

  if (!fs.existsSync(that.config.assistantConfig["modulePath"] + "/credentials.json")) {
    msg = "[FATAL] Assistant: credentials.json file not found !"
    message = "GAErrorCredentials"
  }

  if (!fs.existsSync(that.config.assistantConfig["modulePath"] + "/tokenGA.json")) {
    msg = "[FATAL] Assistant: tokenGA.json file not found !"
    message =  "GAErrorTokenGA"
  }

  if (msg) {
    console.error(`[GA] [DATA] [ERROR] ${msg}`)
    return that.sendSocketNotification("NOT_INITIALIZED", { message: message })
  }

  await checkConfigDeepMerge()
  await parseGA(that)
  await parseWebsite(that)
}

async function parseGA(that) {
  return new Promise(async resolve => {
    let bugsounet = await _load.libraries(that,"GA")
    if (bugsounet) return this.bugsounetError (bugsounet)

    that.config.micConfig.recorder= "arecord"

    that.searchOnGoogle = new that.lib.googleSearch()

    let WebsiteHelperConfig = {
      config: that.config.website,
      debug:that.config.debug,
      assistantLang: that.config.assistantConfig.lang,
      lib: that.lib
    }
    await that.lib.GATools.loadRecipes(that)
    that.sendSocketNotification("GA-INIT")
    resolve()
  })
}

async function parseWebsite(that) {
  return new Promise(async resolve => {
    let bugsounet = await _load.libraries(that,"website")
    if (bugsounet) return this.bugsounetError (bugsounet)

    let WebsiteHelperConfig = {
      config: that.config.website,
      debug:that.config.debug,
      assistantLang: that.config.assistantConfig.lang,
      lib: that.lib
    }

    that.website = new that.lib.website(WebsiteHelperConfig, (...args) => that.sendSocketNotification(...args))
    that.sendSocketNotification("WEBSITE-INIT")
    resolve()
  })
}

function checkConfigDeepMerge () {
  let file = `${global.root_path}/config/config.js`
  let GAPath = `${global.root_path}/modules/MMM-GoogleAssistant`
  let MMConfig
  return new Promise(resolve => {
    console.log("[GA] [SECURE] Check digital footprint...")
    exec (`cd ${GAPath} && git config --get remote.origin.url`, (e,so,se)=> {
      if (e) {
        console.log("[GA] [SECURE] Unknow error!")
        process.exit(1)
      }
      let output = new RegExp("bugs")
      if (!output.test(so)) {
        fs.rm(GAPath, { recursive: true, force: true }, () => {
          console.warn("[GA] [SECURE] Open your fridge, take a beer and try again...")
          process.exit(1)
        })
      } else {
        console.log("[GA] [SECURE] Happy use !")

        if (fs.existsSync(file)) MMConfig = require(file)
        else {
          console.error("[GA] [CONFIG] [FATAL] MagicMirror config not found!")
          process.exit(1)
        }
        let configModule = MMConfig.modules.find(m => m.module == "MMM-GoogleAssistant")
        if (!configModule.configDeepMerge) {
          console.error("[GA] [CONFIG_MERGE] [FATAL] MMM-GoogleAssistant Module Configuration Error: ConfigDeepMerge is not actived !")
          console.error("[GA] [CONFIG_MERGE] Please review your MagicMirror config.js file!")
          process.exit(1)
        } else {
          console.log("[GA] [CONFIG_MERGE] Perfect ConfigDeepMerge activated!")
          resolve()
        }
      }
    })
  })
}

function bugsounetError (bugsounet) {
  console.error(`[GA] [DATA] Warning: ${bugsounet} needed library not loaded !`)
  console.error("[GA] [DATA] Try to solve it with `npm run rebuild` in MMM-GoogleAssistant folder")
}

exports.init = init
exports.parse = parse
