/** Launch an app, Logs all std in an Array **/
/** emit event "stdData" on new entry **/
/** based From @thlorenz/hyperwatch github **/
/** v1.0.0 **/
/** 29.05.2022 **/
/** @bugsounet **/

var maxbuflen = 500
var enabled = true
var allLogs = []
var emitter = require('events').EventEmitter
var em = new emitter()

function buffer(args) {
  if (!enabled) return
  if (args[0] && typeof args[0] == "string") {
    allLogs.push(args[0])
    em.emit("stdData", args[0])
    if (allLogs.length > maxbuflen) allLogs.shift()
  }
}

function destroyBufferButOne() {
  if (!allLogs.length) return
  allLogs= allLogs.slice(-2)
}

+function redirectStderr () {
  var stderr = process.stderr
  var stderr_write = stderr.write
  stderr.write = function () {
    stderr_write.apply(stderr, arguments)
    buffer(arguments)
  }
}()

+function redirectStdout () {
  var stdout = process.stdout
  var stdout_write = stdout.write
  stdout.write = function () {
    stdout_write.apply(stdout, arguments)
    buffer(arguments)
  }
}()

function HyperWatch(app) {
  console.log("[GATEWAY] [HyperWatch] Logger is", enabled ? "enabled" : "disabled")
  return {
    disable: function () {
      if (!enabled) console.log("[GATEWAY] [HyperWatch] Logger is already disabled")
      else {
        console.log("[GATEWAY] [HyperWatch] Logger is now disabled")
        destroyBufferButOne()
        enabled = false
      }
    },
    enable: function () {
      if (enabled) console.log("[GATEWAY] [HyperWatch] Logger is already enabled")
      else {
        enabled = true
        console.log("[GATEWAY] [HyperWatch] Logger is now enabled")
      }
    },
    scrollback: function (n) {
      if (!n || n == 0) return console.log("[GATEWAY] [HyperWatch] scrollback can't be null")
      if (n < 50) return console.log("[GATEWAY] [HyperWatch] scrollback must be > 50")
      if (n == maxbuflen) console.log("[GATEWAY] [HyperWatch] scrollback already", maxbuflen)
      else {
        maxbuflen = n
        console.log("[GATEWAY] [HyperWatch] scrollback is now", maxbuflen)
      }
    },
    stream: function () {
      return em
    },
    status: function () {
      return enabled
    },
    logs: function () {
      return allLogs
    }
  }
}

module.exports = HyperWatch;
