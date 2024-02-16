/** Logs all std in an Array **/
/** emit event "stdData" on new entry **/
/** based From @thlorenz/hyperwatch github **/
/** v1.1.0 **/
/** 28.01.2024 **/
/** @bugsounet **/

/** HyperWatch **/

var emitter = require("events").EventEmitter;

var HyperWatch_maxbuflen = 500;
var HyperWatch_enabled = false;
var HyperWatch_allLogs = [];
var HyperWatch_em = new emitter();

function HyperWatch_buffer (args) {
  if (!HyperWatch_enabled) return;
  if (args[0] && typeof args[0] === "string") {
    HyperWatch_allLogs.push(args[0]);
    HyperWatch_em.emit("stdData", args[0]);
    if (HyperWatch_allLogs.length > HyperWatch_maxbuflen) HyperWatch_allLogs.shift();
  }
}

function HyperWatch_destroyBufferButOne () {
  if (!HyperWatch_allLogs.length) return;
  HyperWatch_allLogs = HyperWatch_allLogs.slice(-2);
}

+(function redirectStderr () {
  var stderr = process.stderr;
  var stderr_write = stderr.write;
  stderr.write = function () {
    stderr_write.apply(stderr, arguments);
    HyperWatch_buffer(arguments);
  };
}())

+ (function redirectStdout () {
  var stdout = process.stdout;
  var stdout_write = stdout.write;
  stdout.write = function () {
    stdout_write.apply(stdout, arguments);
    HyperWatch_buffer(arguments);
  };
}());

const HyperWatch = {
  disable () {
    if (!HyperWatch_enabled) console.log("[GA] [HyperWatch] Logger is already disabled");
    else {
      console.log("[GA] [HyperWatch] Logger is now disabled");
      HyperWatch_destroyBufferButOne();
      HyperWatch_enabled = false;
    }
  },
  enable () {
    if (HyperWatch_enabled) console.log("[GA] [HyperWatch] Logger is already enabled");
    else {
      HyperWatch_enabled = true;
      console.log("[GA] [HyperWatch] Logger is now enabled");
    }
  },
  scrollback (n) {
    if (!n || n == 0) return console.log("[GA] [HyperWatch] scrollback can't be null");
    if (n < 50) return console.log("[GA] [HyperWatch] scrollback must be > 50");
    if (n == HyperWatch_maxbuflen) console.log("[GA] [HyperWatch] scrollback already", HyperWatch_maxbuflen);
    else {
      HyperWatch_maxbuflen = n;
      console.log("[GA] [HyperWatch] scrollback is now", HyperWatch_maxbuflen);
    }
  },
  stream () {
    return HyperWatch_em;
  },
  status () {
    return HyperWatch_enabled;
  },
  logs () {
    return HyperWatch_allLogs;
  }
};

module.exports = HyperWatch;
