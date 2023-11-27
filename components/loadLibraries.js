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
    { "../components/activateAssistant.js": "activateAssistant" }
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
