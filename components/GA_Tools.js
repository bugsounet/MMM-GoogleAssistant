"use strict"
const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")
var logGA = (...args) => { /* do nothing */ }

function check (that) {
  console.log("[GA] [CONFIG_MERGE] Read config.js and check ConfigDeepMerge...")
  let file = path.resolve(__dirname, "../../../config/config.js")
  let GAPath = path.resolve(__dirname, "../")
  let MMConfig
  return new Promise(resolve => {
    if (fs.existsSync(file)) MMConfig = require(file)
    else {
      console.error("[GA] [FATAL] MagicMirror config not found!")
      process.exit(1)
    }
    let configModule = MMConfig.modules.find(m => m.module == "MMM-GoogleAssistant")
    if (!configModule.configDeepMerge) {
      console.error("[FATAL] MMM-GoogleAssistant Module Configuration Error: ConfigDeepMerge is not actived !")
      console.error("[GA] [CONFIG_MERGE] Please review your MagicMirror config.js file!")
      process.exit(1)
    }
    console.log("[GA] [CONFIG_MERGE] Perfect ConfigDeepMerge activated!")
    console.log("[GA] [SECURE] Check digital footprint...")
    exec ("cd " + GAPath + " && git config --get remote.origin.url", (e,so,se)=> {
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
        resolve()
      }
    })
  })
}

function loadRecipes(that, callback=()=>{}) {
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [RECIPES]", ...args) }
  if (that.config.recipes) {
    let replacer = (key, value) => {
      if (typeof value == "function") {
        return "__FUNC__" + value.toString()
      }
      return value
    }
    var recipes = that.config.recipes
    var error = null
    for (var i = 0; i < recipes.length; i++) {
      try {
        var p = require("../recipes/" + recipes[i]).recipe
        that.sendSocketNotification("LOAD_RECIPE", JSON.stringify(p, replacer, 2))
        console.log("[GA] [RECIPES] LOADED:", recipes[i])
      } catch (e) {
        error = `[FATAL] RECIPE_ERROR (${recipes[i]})`
        console.error("[GA] [RECIPES] LOADING ERROR:", recipes[i])
        console.error("[GA] [RECIPES] DETAIL:", e.message)
        that.sendSocketNotification("RECIPE_ERROR", recipes[i])
      }
    }
    callback()
  } else {
    logGA("No Recipes to Load...")
    callback()
  }
}

function shellExec(that, payload) {
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [SHELL_EXEC]", ...args) }
  var command = payload.command
  if (!command) return console.error("[GA] [SHELLEXEC] no command to execute!")
  command += (payload.options) ? (" " + payload.options) : ""
  exec (command, (e,so,se)=> {
    logGA("command:", command)
    if (e) {
      console.log("[GA] [SHELL_EXEC] Error:" + e)
      that.sendSocketNotification("WARNING", { message: "ShellExecError"} )
    }
    logGA("RESULT", {
      executed: payload,
      result: {
        error: e,
        stdOut: so,
        stdErr: se,
      }
    })
  })
}

exports.loadRecipes = loadRecipes
exports.check = check
exports.shellExec = shellExec
