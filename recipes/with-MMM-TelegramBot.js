var recipe = {
  commands: {
    "TELBOT_READY": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.telegramQuery= function(command, handler) {
            var query = handler.args
            if (!query) handler.reply("TEXT", this.translate("QUERY_HELP"))
            else module.socketNotificationReceived("ASSISTANT_ACTIVATE", {
              type: "TEXT",
              key: query
            })
          }
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "query",
            callback: "telegramQuery",
            description: module.translate("QUERY_HELP")
          })
        }
      }
    }
  },
  plugins: {
    onReady: "TELBOT_READY"
  }
}

exports.recipe = recipe // Don't remove this line.
