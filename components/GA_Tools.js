"use strict"
const { exec } = require("child_process")
const fs = require("fs")
var logGA = (...args) => { /* do nothing */ }

function loadRecipes(that) {
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [RECIPES]", ...args) }
  return new Promise(resolve => {
    if (that.config.recipes) {
      let replacer = (key, value) => {
        if (typeof value == "function") {
          return "__FUNC__" + value.toString()
        }
        return value
      }
      var recipes = that.config.recipes
      var error = null
      var nb_Err = 0
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
          nb_Err++
        }
      }
      if (!nb_Err) console.log("[GA] Recipes loaded!")
      else console.log(`[GA] Recipes loaded but {$nb_Err} detected!`)
      resolve()
    } else {
      logGA("No Recipes to Load...")
      resolve()
    }
  })
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
exports.shellExec = shellExec
