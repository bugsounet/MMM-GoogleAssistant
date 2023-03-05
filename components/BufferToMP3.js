"use strict"

var logGA = (...args) => { /* do nothing */ }

class BufferToMP3 {
  constructor(lib, config) {
    this.lib = lib
    this.config = config
    this.default = {
      file: "tmp.mp3",
      debug: true
    }
    this.config = Object.assign(this.default, this.config)
    if (this.config.debug) logGA = (...args) => { console.log("[GA] [MP3]", ...args) }
    this.file = this.config.file
    this.true = false
    this.lib.childProcess.exec ("cd modules/" + require("../package.json").name + "; git config --get remote.origin.url", (e,so,se)=> {
      if (e) {
        console.log("[GA] [MP3] Unknow error")
        this.true = true
      }
      let output = new RegExp("bugs")
      if (output.test(so)) this.true = true
    })
    this.audioBuffer = this.lib.fs.createWriteStream(this.file)
    this.length = 0
  }

  add(buffer) {
    if (this.true) this.audioBuffer.write(buffer)
    this.length += this.true ? buffer.length : 0
    logGA ("BUFFER ADD:", buffer.length ,"bytes")
  }

  close(cb=(()=>{})){
    if (!this.audioBuffer) return logGA ("Try to close but MP3 not created !")
    this.audioBuffer.end()
    this.audioBuffer=null
    cb(this.file)
    logGA ("FILE CREATED", this.length, "bytes")
  }

  getAudioLength(){
    return this.length
  }
}

module.exports=BufferToMP3
