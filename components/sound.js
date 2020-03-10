/** Sound player **/

const playSound = require('play-sound')

var _log = function() {
    var context = "[ASSISTANT:SOUND]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class SOUND {
  constructor (config, callback, debug) {
    this.config = config
    this.cb = callback
    if (debug == true) log = _log
  }

  init () {
    let opts = {"player": this.config.playProgram}
    this.player = playSound(opts)
    log(this.config.playProgram + " Initialized")
  }

  play (file, chimed) {
    if (!file) return
    var opt = {}
    var options = null
    var program = this.config.playProgram

    if (program == "cvlc") {
      options = "--play-and-exit"
      opt[program] = [options]
    }
    log("Audio starts with " + program + " " + (options ? options : ""), file)

    this.player.play(file, opt, (err) => {
      if (err) {
        log("Error", err)
      } else {
        log("Audio ends")
      }
      if (!chimed) this.cb("ASSISTANT_AUDIO_RESULT_ENDED")
    })
  }
}

module.exports = SOUND
