/**  with-MMM-Memo.js   **/
/**  version: 13/09/20 **/
/**  @bugsounet  **/
/**  It translation : @Mirco **/

var recipe = {
  transcriptionHooks: {
    "MEMO_ADD_FR": {
      pattern: "ajoute vers (.*)",
      command: "MEMO_ADD"
    },
    "MEMO_DEL_FR": {
      pattern: "supprime (.*)",
      command: "MEMO_DEL"
    },
    "MEMO_CLEAN_FR": {
      pattern: "efface (.*)",
      command: "MEMO_CLEAN"
    },
    "MEMO_DISPLAY_FR": {
      pattern: "affiche (.*)",
      command: "MEMO_DISPLAY"
    },
    "MEMO_WARNING_FR": {
      pattern: "ajoute important sur (.*)",
      command: "MEMO_WARN"
    },
    "MEMO_ADD_IT": {
      pattern: "aggiungi alla lista (.*)",
      command: "MEMO_ADD"
    },
    "MEMO_DEL_IT": {
      pattern: "Elimina dalla lista (.*)",
      command: "MEMO_DEL"
    },
    "MEMO_CLEAN_IT": {
      pattern: "pulisci la lista (.*)",
      command: "MEMO_CLEAN"
    },
     "MEMO_DISPLAY_IT": {
      pattern: "visualizzo la lista (.*)",
      command: "MEMO_DISPLAY"
    },
    "MEMO_WARNING_IT": {
      pattern: "Aggiungi segnale di priorità (.*)",
      command: "MEMO_WARN"
    },
    "MEMO_ADD_EN": {
      pattern: "add to (.*)",
      command: "MEMO_ADD"
    },
    "MEMO_DEL_EN": {
      pattern: "delete on (.*)",
      command: "MEMO_DEL"
    },
    "MEMO_CLEAN_EN": {
      pattern: "clean (.*)",
      command: "MEMO_CLEAN"
    },
    "MEMO_DISPLAY_EN": {
      pattern: "display (.*)",
      command: "MEMO_DISPLAY"
    },
    "MEMO_WARNING_EN": {
      pattern: "warning add to (.*)",
      command: "MEMO_WARN"
    },
  },
  commands: {
    "MEMO_ADD": {
      shellExec: {
         exec: (params) => {
           var memoTitle = params[1].split(" ")[0]
           var item = params[1].split(" ").slice(1).join(" ")
           if (!memoTitle || !item) return null
           return "curl -G -v 'http://127.0.0.1:8080/AddMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item="+ item+ "' --data-urlencode 'level=INFO'"
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "MEMO_DEL": {
      shellExec: {
         exec: (params) => {
           var memoTitle = params[1].split(" ")[0]
           var item = params[1].split(" ").slice(1).join(" ")
           if (!memoTitle || !item) return null
           return "curl -G -v 'http://127.0.0.1:8080/RemoveMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item="+ item +"'"
        }
      },
      soundExec: {
        chime: "close"
      }
    },
    "MEMO_CLEAN": {
      shellExec: {
         exec: (params) => {
           var memoTitle = params[1].split(" ")[0]
           if (!memoTitle) return null
           return "curl -G -v 'http://127.0.0.1:8080/RemoveMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item=ALL'"
        }
      },
      soundExec: {
        chime: "close"
      }
    },
    "MEMO_DISPLAY": {
      shellExec: {
         exec: (params) => {
           var memoTitle = params[1].split(" ")[0]
           var item = params[1].split(" ").slice(1).join(" ")
           if (!memoTitle || !item) return null
           return "curl -G -v 'http://127.0.0.1:8080/DisplayMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item=ALL'"
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "MEMO_WARN": {
      shellExec: {
         exec: (params) => {
           var memoTitle = params[1].split(" ")[0]
           var item = params[1].split(" ").slice(1).join(" ")
           if (!memoTitle || !item) return null
           return "curl -G -v 'http://127.0.0.1:8080/AddMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item="+ item+ "' --data-urlencode 'level=WARNING'"
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "TELBOT_MEMO": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.telegramMemoADD= function(command, handler) {
            var memoTitle = handler.args ? handler.args.split(" ")[0] : null
            var item = handler.args ? handler.args.split(" ").slice(1).join(" ") : null
            if (config.language == "fr") {
              var helpMSG = "/MemoADD <nom du memo> <choses à ajouter à la liste>"
              var sendMSG = "Je vais ajouter à votre memo " + memoTitle + ": " + item
            }
            else if (config.language == "it") {
              var helpMSG = "/MemoADD <nome memo> <oggetto da aggiungere>"
              var sendMSG = "Ho aggiunto a " + memoTitle + ": " + item 
            }
            else { // default en
              var helpMSG = "/MemoADD <memo> <something to ADD>"
              var sendMSG = "I will add to your " + memoTitle + " memo: " + item
            }
            if (!memoTitle || !item) return handler.reply("TEXT", helpMSG) 
            var command = "curl -G -v 'http://127.0.0.1:8080/AddMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item="+ item+ "' --data-urlencode 'level=INFO'"
            module.sendSocketNotification("SHELLEXEC", { command: command })
            handler.reply("TEXT", sendMSG)
          }
          module.telegramMemoDEL= function(command, handler) {
            var memoTitle = handler.args ? handler.args.split(" ")[0] : null
            var item = handler.args ? handler.args.split(" ").slice(1).join(" ") : null
            if (config.language == "fr") {
              var helpMSG = "/MemoDEL <nom du memo> <numéro de la liste>"
              var sendMSG = "Je vais supprimer de votre memo " + memoTitle + " la ligne numero: " + item
            }
            else if (config.language == "it") {
              var helpMSG = "/MemoDEL <nome memo> <numero da cancellare>"
              var sendMSG = "Ho cancellato da " + memoTitle + " il numero: " + item
            }
            else { // default en
              var helpMSG = "/MemoDEL <memo name> <number to DEL>"
              var sendMSG = "I will delete from your " + memoTitle + " memo line number: " + item
            }
            if (!memoTitle || !item) return handler.reply("TEXT", helpMSG)
            var command = "curl -G -v 'http://127.0.0.1:8080/RemoveMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item="+ item +"'"
            module.sendSocketNotification("SHELLEXEC", { command: command })
            handler.reply("TEXT", sendMSG)
          }
          module.telegramMemoCLEAN= function(command, handler) {
            var memoTitle = handler.args ? handler.args.split(" ")[0] : null
            if (config.language == "fr") {
              var helpMSG = "/MemoCLEAN <nom du memo>"
              var sendMSG = "Je vais nettoyer votre memo: " + memoTitle
            }
            else if (config.language == "it") {
              var helpMSG = "/MemoCLEAN <nome memo>"
              var sendMSG = "Ho cancellato il tuo memo: " + memoTitle
            }
            else { // default en
              var helpMSG = "/MemoCLEAN <memo name>"
              var sendMSG = "I will clean up your memo: " + memoTitle
            }
            if (!memoTitle) return handler.reply("TEXT", helpMSG)
            var command = "curl -G -v 'http://127.0.0.1:8080/RemoveMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item=ALL'"
            module.sendSocketNotification("SHELLEXEC", { command: command })
            handler.reply("TEXT", sendMSG)
          }
          module.telegramMemoDISPLAY= function(command, handler) {
            var memoTitle = handler.args ? handler.args.split(" ")[0] : null
            if (config.language == "fr") {
              var helpMSG = "/MemoDISPLAY <nom du memo>"
              var sendMSG = "Je vous montre votre memo " + memoTitle 
            }
            else if (config.language == "it") {
              var helpMSG = "/MemoDISPLAY <nome memo>"
              var sendMSG = "Ho aggiunto a " + memoTitle
            }
            else { // default en
              var helpMSG = "/MemoDISPLAY <memo>"
              var sendMSG = "I show your " + memoTitle + " memo"
            }
            if (!memoTitle) return handler.reply("TEXT", helpMSG) 
            var command = "curl -G -v 'http://127.0.0.1:8080/DisplayMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item=ALL'"
            module.sendSocketNotification("SHELLEXEC", { command: command })
            handler.reply("TEXT", sendMSG)
          }
          module.telegramMemoWARN= function(command, handler) {
            var memoTitle = handler.args ? handler.args.split(" ")[0] : null
            var item = handler.args ? handler.args.split(" ").slice(1).join(" ") : null
            if (config.language == "fr") {
              var helpMSG = "/MemoWARN <nom du memo> <important a ajouter>"
              var sendMSG = "J'ajoute la note importante à votre memo " + memoTitle + ": " + item
            }
            else if (config.language == "it") {
              var helpMSG = "/MemoWARN <nome memo> <oggetto da aggiungere>"
              var sendMSG = "Ho aggiunto il segnale di priorità" + memoTitle + ": " + item 
            }
            else { // default en
              var helpMSG = "/MemoWARN <memo> <warning to ADD>"
              var sendMSG = "I will add this warning to your " + memoTitle + " memo: " + item
            }
            if (!memoTitle || !item) return handler.reply("TEXT", helpMSG) 
            var command = "curl -G -v 'http://127.0.0.1:8080/AddMemo?memoTitle=" + memoTitle + "' --data-urlencode 'item="+ item+ "' --data-urlencode 'level=WARNING'"
            module.sendSocketNotification("SHELLEXEC", { command: command })
            handler.reply("TEXT", sendMSG)
          }
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "MemoADD",
            callback: "telegramMemoADD",
            description: "MMM-Memo ADD"
          })
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "MemoDEL",
            callback: "telegramMemoDEL",
            description: "MMM-Memo DEL"
          })
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "MemoCLEAN",
            callback: "telegramMemoCLEAN",
            description: "MMM-Memo CLEAN"
          })
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "MemoDISPLAY",
            callback: "telegramMemoDISPLAY",
            description: "MMM-Memo DISPLAY"
          })
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "MemoWARN",
            callback: "telegramMemoWARN",
            description: "MMM-Memo WARNING"
          })
        }
      }
    }
  },
  plugins: {
    onReady: "TELBOT_MEMO"
  }
}
exports.recipe = recipe
