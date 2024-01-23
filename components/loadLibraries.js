"use strict"

/** Load sensible library without black screen **/
var logGA = (...args) => { /* do nothing */ }

function libraries(that) {
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [LIB]", ...args) }
  let libraries= [
    // { "library to load" : "store library name" }
    { "./assistantConverse.js": "Assistant" },
    { "./screenParser.js" : "ScreenParser" },
    { "./GA_Tools.js": "GATools" },
    { "./googleSearch.js": "googleSearch" },
    { "./activateAssistant.js": "activateAssistant" },

    { "./systemInformation.js": "SystemInformation" },

    { "./website.js" : "website" },

    //{ "./SH_Tools.js": "SHTools" },
    //{ "./SH_Middleware.js": "SmartHome" },
    //{ "./actionsOnGoogle.js": "ActionsOnGoogle" },
    //{ "./DeviceManagement.js": "Device" },
    //{ "./SH_Callbacks.js": "callback" },
    //{ "./SH_Homegraph.js": "homegraph" }

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
    if (errors) {
      console.error("[GA] [LIB] Some libraries missing!")
      that.sendSocketNotification("NOT_INITIALIZED", { message: "Library loading Error!" })
    } else console.log("[GA] [LIB] All libraries loaded!")
  })
}

exports.libraries = libraries
