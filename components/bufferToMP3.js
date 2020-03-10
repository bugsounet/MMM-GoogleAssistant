const fs = require("fs")

var _log = function() {
    var context = "[ASSISTANT:BM]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class BufferToMP3 {
  constructor(config) {
    var debug = (config.debug) ? config.debug : false
    if (debug == true) log = _log
    this.file = config.file
    log ("MP3 FILE CREATING:", this.file)
    this.audioBuffer = fs.createWriteStream(this.file)
    this.length = 0
  }

  add(buffer) {
    this.audioBuffer.write(buffer)
    this.length += buffer.length
  }

  close(cb=()=>{}) {
    this.audioBuffer.end()
    this.audioBuffer = null
    cb(this.file)
    log ("MP3 FILE CREATED")
  }

  getAudioLength() {
    return this.length
  }
}

module.exports = BufferToMP3
