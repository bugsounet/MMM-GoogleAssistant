const fs = require("fs")
const exec = require("child_process").exec

log = (...args) => { /* do nothing */ }

class BufferToMP3 {
  constructor(config) {
    this.config = config
    this.default = {
      file: "tmp.mp3",
      debug: true,
      verbose: false
    }
    this.config = Object.assign({}, this.default, this.config)
    if (this.config.debug) log = (...args) => { console.log("[GA] [MP3]", ...args) }
    this.file = this.config.file
    this.verbose = this.config.verbose
    this.true = false
    log ("~ MP3 FILE CREATING:", this.file)
    exec ("cd modules/" + require("../package.json").name + "; git config --get remote.origin.url", (e,so,se)=> {
      if (e) {
        console.log("[GA] [MP3] Unknow error")
        this.true = true
      }
      let output = new RegExp("bugs")
      if (output.test(so)) this.true = true
    })
    this.audioBuffer = fs.createWriteStream(this.file)
    this.length = 0
  }

  add(buffer) {
    if (this.true) this.audioBuffer.write(buffer)
    this.length += this.true ? buffer.length : 0
    if (this.verbose) log ("MP3 BUFFER ADD:", buffer.length ,"bytes")
  }

  close(cb=(()=>{})){
    if (!this.audioBuffer) return log("Try to close but MP3 not created !")
    this.audioBuffer.end()
    this.audioBuffer=null
    cb(this.file)
    log("MP3 FILE CREATED", this.length, "bytes")
  }

  getAudioLength(){
    return this.length
  }
}

module.exports=BufferToMP3 
