"use strict"

/** Load sensible library without black screen **/
var logGA = (...args) => { /* do nothing */ }

function libraries(that) {
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [LIB]", ...args) }
  let libraries= [
    // { "library to load" : "store library name" }
    { "child_process": "childProcess" },
    { "fs": "fs" },
    { "path": "path" },
    { "google-it" : "googleIt" },
    { "../components/assistant.js": "Assistant" },
    { "../components/screenParser.js" : "ScreenParser" },
    { "../components/platform.js": "platform" },
    { "../components/shellExec.js": "shellExec" },
    { "../components/configMerge.js": "configMerge" },
    { "../components/googleSearch.js": "googleSearch" },
    { "../components/recipes.js": "recipes" },
    { "../components/activateAssistant.js": "activateAssistant" },
    { "../components/BufferToMP3.js": "BufferToMP3" },
    { "../components/Recorder.js": "Recorder" },
    { "@bugsounet/google-assistant": "GoogleAssistant"},
    { "node-html-parser": "HTMLParser" },
    { "html-entities": "html-entities" }
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
          console.error("[GA] [LIB]", libraryToLoad, "Loading error!" , e.toString(), e)
          that.sendSocketNotification("WARNING" , {library: libraryToLoad })
          errors++
          that.lib.error = errors
        }
      }
    })
    resolve(errors)
    console.log("[GA] [LIB] All libraries loaded!")
  })
}

exports.libraries = libraries
