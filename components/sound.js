/** Sound player **/

const playSound = require('play-sound')

var _log = function() {
    var context = "[SOUND]"
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
    console.log("[SOUND] " + this.config.playProgram + " Initialized")
  }

  play (file, ended = true) {
    if (!file) return

    log("Audio starts with " + this.config.playProgram , file)

    this.player.play(file, (err) => {
      if (err) {
        log("Error", err)
      } else {
        log("Audio ends")
      }
      if (ended) this.cb("AUDIO_END")
    })
  }
}

module.exports = SOUND
