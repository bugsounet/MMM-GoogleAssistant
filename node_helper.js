//
// Module : MMM-GoogleAssistant
//

const fs = require("fs")
const checker = require("./components/checker.js")
var NodeHelper = require("node_helper")
var logGA = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function () {
    this.lib = { error: 0 }
    this.config = {}
    this.alreadyInitialized = false
  },

  socketNotificationReceived: async function (noti, payload) {
    switch (noti) {
      case "PRE-INIT":
        if (this.alreadyInitialized) {
          console.error("[GA] You can't use MMM-GoogleAssistant in server mode")
          this.sendSocketNotification("ERROR", "You can't use MMM-GoogleAssistant in server mode")
          setTimeout(() => process.exit(), 5000)
          return
        }
        if (this.website) return
        this.alreadyInitialized = true
        this.config = payload
        console.log("[GA] MMM-GoogleAssistant Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.config.assistantConfig["modulePath"] = __dirname
        this.initGA()
        break
      case "WEBSITE-INIT":
        let Version = {
          version: require('./package.json').version,
          rev: require('./package.json').rev,
          lang: this.config.assistantConfig.lang
        }
        this.sendSocketNotification("INITIALIZED", Version)
        console.log("[GA] Assistant Ready!")
        await this.parseWebsite()
        this.website.init(payload)
        break
      case "SMARTHOME-INIT":
        await this.parseSmarthome()
        this.website.server()
        break
      case "ACTIVATE_ASSISTANT":
        this.lib.activateAssistant.activate(this, payload)
        break
      case "SHELLEXEC":
        this.lib.GATools.shellExec(this, payload)
        break
      case "GOOGLESEARCH":
        this.searchOnGoogle.search(this, payload)
        break
      case "HELLO":
        if (!this.website) {
          // library is not loaded ... retry (not needed but...)
          setTimeout(() => { this.socketNotificationReceived("HELLO", payload) }, 1000)
          return
        }
        this.website.setActiveVersion(payload)
        break
      case "RESTART":
        this.website.restartMM()
        break
      case "CLOSE":
        this.website.doClose()
        break
      case "EXTStatus":
        if (!this.website) {
          // library is not loaded ... retry (not needed but...)
          setTimeout(() => { this.socketNotificationReceived("EXTStatus", payload) }, 1000)
          return
        }
        this.website.setEXTStatus(payload)
        break
      case "TB_SYSINFO":
        let result = await this.website.website.systemInformation.lib.Get()
        result.sessionId = payload
        this.sendSocketNotification("TB_SYSINFO-RESULT", result)
        break
      case "GET-SYSINFO":
        this.sendSocketNotification("SYSINFO-RESULT", await this.website.website.systemInformation.lib.Get())
        break
    }
  },

  initGA: async function() {
    var msg = null
    var message = null
  
    if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/credentials.json")) {
      msg = "[FATAL] Assistant: credentials.json file not found !"
      message = "GAErrorCredentials"
    }
  
    if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/tokenGA.json")) {
      msg = "[FATAL] Assistant: tokenGA.json file not found !"
      message =  "GAErrorTokenGA"
    }
  
    if (msg) {
      console.error(`[GA] [DATA] [ERROR] ${msg}`)
      return this.sendSocketNotification("NOT_INITIALIZED", { message: message })
    }
  
    await checker.checkConfigDeepMerge()
    let bugsounet = await this.libraries("GA")
    if (bugsounet) return this.bugsounetError (bugsounet)

    this.config.micConfig.recorder= "arecord"

    this.searchOnGoogle = new this.lib.googleSearch()

    await this.lib.GATools.loadRecipes(this)
    this.sendSocketNotification("GA-INIT")
  },

  parseWebsite: async function () {
    return new Promise(async resolve => {
      let bugsounet = await this.libraries("website")
      if (bugsounet) return this.bugsounetError (bugsounet)
  
      let WebsiteHelperConfig = {
        config: this.config.website,
        debug: this.config.debug,
        assistantLang: this.config.assistantConfig.lang,
        lib: this.lib
      }
  
      this.website = new this.lib.website(WebsiteHelperConfig, (...args) => this.sendSocketNotification(...args))
      resolve()
    })
  },

  parseSmarthome: async function() {
    if (!this.config.website.CLIENT_ID) return
    return new Promise(async resolve => {
      let bugsounet = await this.libraries("smarthome")
      if (bugsounet) return this.bugsounetError (bugsounet)
  
      let SmarthomeHelperConfig = {
        config: this.config.website,
        debug: this.config.debug,
        assistantLang: this.config.assistantConfig.lang,
        lib: this.lib
      }
  
      this.smarthome = new this.lib.smarthome(SmarthomeHelperConfig, (...args) => this.sendSocketNotification(...args))
      resolve()
    })
  },

  libraries: function (type) {
    if (this.config.debug) logGA = (...args) => { console.log("[GA] [LIB]", ...args) }
    let Libraries = []
    let GA= [
      // { "library to load" : "store library name" }
      { "./components/assistantConverse.js": "Assistant" },
      { "./components/screenParser.js" : "ScreenParser" },
      { "./components/GA_Tools.js": "GATools" },
      { "./components/googleSearch.js": "googleSearch" },
      { "./components/activateAssistant.js": "activateAssistant" }
    ]
   
    let website= [
      { "./components/systemInformation.js": "SystemInformation" },
      { "./components/website.js" : "website" }
    ]
  
    let smarthome= [
      { "./components/smarthome.js" : "smarthome" },
  
      //{ "./components/SH_Tools.js": "SHTools" },
      //{ "./components/SH_Middleware.js": "SmartHome" },
      //{ "./components/actionsOnGoogle.js": "ActionsOnGoogle" },
      //{ "./components/DeviceManagement.js": "Device" },
      //{ "./components/SH_Callbacks.js": "callback" },
      //{ "./components/SH_Homegraph.js": "homegraph" }
  
    ]
    let errors = 0
  
    switch(type) {
      case "GA":
        logGA("Loading GA Libraries...")
        Libraries = GA
        break
      case "website":
        logGA("Loading website Libraries...")
        Libraries = website
        break
      case "smarthome":
        logGA("Loading smarhome Libraries...")
        Libraries = smarthome
        break
      default:
        console.log(`${type}: Unknow library database...`)
        return
        break
    }
  
    return new Promise(resolve => {
      Libraries.forEach(library => {
        for (const [name, configValues] of Object.entries(library)) {
          let libraryToLoad = name
          let libraryName = configValues
  
          try {
            if (!this.lib[libraryName]) {
              this.lib[libraryName] = require(libraryToLoad)
              logGA(`Loaded: ${libraryToLoad} --> this.lib.${libraryName}`)
            }
          } catch (e) {
            console.error(`[GA] [LIB] ${libraryToLoad} Loading error!`, e.message)
            this.sendSocketNotification("ERROR" , `Loading error! library: ${libraryToLoad}`)
            errors++
            this.lib.error = errors
          }
        }
      })
      resolve(errors)
      if (errors) {
        console.error("[GA] [LIB] Some libraries missing!")
        if (type == "GA") this.sendSocketNotification("NOT_INITIALIZED", { message: "Library loading Error!" })
      } else console.log(`[GA] [LIB] All ${type} libraries loaded!`)
    })
  },

  bugsounetError: function (bugsounet) {
    console.error(`[GA] [DATA] Warning: ${bugsounet} needed library not loaded !`)
    console.error("[GA] [DATA] Try to solve it with `npm run rebuild` in MMM-GoogleAssistant folder")
  }
})
