const path = require("path")
const fs = require("fs")
const exec = require("child_process").exec

var _log = function() {
    var context = "[ASSISTANT:AM]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class ACTIONMANAGER {
  constructor (config, debug = false) {
    this.config = config
    if (debug == true) log = _log
  }

  makeAction (callback=()=>{}) {
    log ("Making Action:", this.config.autoMakeAction)
    if (!this.config.autoMakeAction) {
      callback()
      return
    }
    var template = {
      manifest: {
        displayName: "MAGICMIRROR CUSTOM DEVICE ACTION",
        invocationName : "MAGICMIRROR CUSTOM DEVICE ACTION",
        category: "PRODUCTIVITY"
      },
      actions: [],
      types: [],
    }
    //Hmmm... Multi language supprting is not yet.
    if (this.config.actionLocale) {
      template.locale = this.config.actionLocale
    }

    var actions = this.config.actions
    for (var key in actions) {
      if (actions.hasOwnProperty(key)) {
        var name = key
        var action = actions[key]
        if (Array.isArray(action.patterns)) {
          var at = {
            name: "",
            availability: {deviceClasses: [{assistantSdkDevice: {}}]},
            intent: {
              name: "",
              parameters: [],
              trigger: {queryPatterns:[]},
            },
            fulfillment:{
              staticFulfillment: {
                templatedResponse: {
                  items: []
                }
              }
            }
          }
          at.name = "GA.action." + name
          at.intent.name = (action.intentName) ? action.intentName : "GA.intent." + name
          at.intent.trigger.queryPatterns = action.patterns
          at.intent.parameters = (action.parameters) ? action.parameters : []
          at.fulfillment.staticFulfillment.templatedResponse.items[0] = {
            simpleResponse:{
              textToSpeech:(action.response) ? action.response : ""
            }
          }
          at.fulfillment.staticFulfillment.templatedResponse.items[1] = {
            deviceExecution: {
              command: (action.commandName) ? action.commandName : "GA.command." + name,
              params: (action.commandParams) ? action.commandParams : {}
            }
          }
          template.actions.push(at)
          if (action.types) {
            template.types = template.types.concat(action.types)
          }
        }
      }
    }
    var jsonTxt = JSON.stringify(template, null, 2)
    fs.writeFile(path.resolve(__dirname, "../tmp/action_package.json"), jsonTxt, "utf8", (err)=>{
      if (err) {
        log("Error - Action package JSON file creation failed:", err.message)
        callback()
      } else {
        this.gactionCLI(callback)
      }
    })
  }

  gactionCLI (callback=()=>{}) {
    log("Updating Action:", this.config.autoUpdateAction)
    if (!this.config.autoUpdateAction) {
      callback()
      return
    }
    if (!this.config.projectId) {
      log("Error - project ID is required. Updating is canceled.")
      callback()
      return
    }
    var actionFile = path.resolve(__dirname, "../tmp/action_package.json")
    var cdPath = path.resolve(__dirname, "../utility")
    var cmd = `cd ${cdPath}; ./gactions test --action_package ${actionFile} --project ${this.config.projectId}`
    callback()

    exec(cmd, (e, so, se)=>{
      log("Executing:", cmd)
      if (e) {
        log("Error - Action Package update failed:", e.message)
      } else {
        log("Action Package updated:", [so, se])
      }
      callback()
    })
    
  }
}

module.exports = ACTIONMANAGER
