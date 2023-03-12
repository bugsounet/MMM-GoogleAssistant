"use strict"

var logGA = (...args) => { /* do nothing */ }

function load(that, callback=()=>{}) {
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
        return this.error(that, error, {message: "GAErrorRecipe", values: recipes[i]}, e)
      }
    }
    callback()
  } else {
    logGA("No Recipes to Load...")
    callback()
  }
}

function error(that, err, error, details = null) {
  if (details) console.log("[GA] [RECIPES] [ERROR]" + err, details.message, details)
  else console.log("[GA] [RECIPES] [ERROR]" + err)
  return that.sendSocketNotification("NOT_INITIALIZED", { message: error.message, values: error.values })
}

exports.load = load
exports.error = error
