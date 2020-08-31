/**  with-status.js **/
/**  send the status of assistant to a python script **/
/** For LED Strip for example **/
/**     @bugsounet       **/

var recipe = {
  commands: {
    "Status": {
      shellExec: {
        exec: (param) => {
            return "python /home/pi/myscript.py " + param.status.actual
        }
      }
    }
  },
  plugins: {
    onStatus: "Status"
  },
}

exports.recipe = recipe
