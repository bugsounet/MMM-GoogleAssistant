"use strict"

/** Load sensible library without black screen **/
var logGA = (...args) => { /* do nothing */ }

function libraries(that) {
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [LIB]", ...args) }
  let libraries= [
    // { "library to load" : "store library name" }
    { "../components/BufferToMP3.js": "BufferToMP3" },
    { "../components/lpcm16.js": "Recorder" },
    { "../components/googleAssistant": "GoogleAssistant"},
    { "cheerio": "cheerio" },
    { "child_process": "childProcess" },
    { "fs": "fs" },
    { "os": "os" },
    { "html-entities": "html-entities" },
    { "node-html-parser": "HTMLParser" },
    { "path": "path" },
    { "../components/assistantConverse.js": "Assistant" },
    { "../components/screenParser.js" : "ScreenParser" },
    { "../components/platform.js": "platform" },
    { "../components/shellExec.js": "shellExec" },
    { "../components/configMerge.js": "configMerge" },
    { "../components/googleSearch.js": "googleSearch" },
    { "../components/searchOnGoogle.js": "searchOnGoogle" },
    { "../components/recipes.js": "recipes" },
    { "../components/activateAssistant.js": "activateAssistant" },

    /*
    { "../components/GWTools.js": "GWTools" },
    { "../components/SHTools.js": "SHTools" },
    { "../components/GatewayMiddleware.js": "Gateway"},
    { "../components/hyperwatch.js": "hyperwatch" },
    { "../components/SmartHomeMiddleware.js": "SmartHome" },
    { "../components/actionsOnGoogle.js": "ActionsOnGoogle" },
    { "../components/DeviceManagement.js": "Device" },
    { "../components/SHCallbacks.js": "callback" },
    { "../components/homegraph.js": "homegraph" },
    { "../components/systemInformation.js": "SystemInformation" },
    { "../components/wirelessTools.js": "wirelessTools" },
    { "node-pty": "pty" },
    { "express": "express" },
    { "http": "http" },
    { "semver": "semver" },
    { "body-parser": "bodyParser" },
    { "express-session": "session" },
    { "passport": "passport" },
    { "passport-local" : "LocalStrategy" },
    { "socket.io": "Socket" },
    { "cors": "cors" },
    { "util": "util" },
    { "systeminformation": "si" },
    { "command-exists": "commandExists" },
    { "readline": "readline" },
    { "stream": "Stream" },
    { "actions-on-google": "actions" },
    { "googleapis": "googleapis" },
    { "google-auth-library": "GoogleAuthLibrary" },
    { "lodash": "_" },
    { "moment": "moment" }
    */
  ]
  let errors = 0
  return new Promise(resolve => {
    libraries.forEach(library => {
      for (const [name, configValues] of Object.entries(library)) {
        let libraryToLoad = name
        let libraryName = configValues

        try {
          if (!that.lib[libraryName]) {
            that.lib[libraryName] = require(libraryToLoad)
            logGA("Loaded:", libraryToLoad, "->", "this.lib."+libraryName)
          }
        } catch (e) {
          console.error("[GA] [LIB]", libraryToLoad, "Loading error!" , e.message)
          that.sendSocketNotification("ERROR" , "Loading error! library: " + libraryToLoad)
          errors++
          that.lib.error = errors
        }
      }
    })
    resolve(errors)
    if (errors) console.error("[GA] [LIB] Some libraries missing!")
    else console.log("[GA] [LIB] All libraries loaded!")
  })
}

exports.libraries = libraries
