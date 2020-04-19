'use strict'

var spawn = require('child_process').spawn
var _log = function() {
    var context = "[ASSISTANT:REC]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}
class LPCM16 {
  constructor (options, streamOut, afterCallback) {
    this.cp = null
    var defaults = {
      recorder: 'arecord',
      sampleRate: 16000,
      channels: 1,
      compress: false,
      threshold: 0.5,
      thresholdStart: null,
      thresholdEnd: null,
      silence: '1.0',
      verbose: false
    }
    this.options = Object.assign(defaults, options)
    if (this.options.verbose == true) log = _log
    this.stream = null
    this.streamOut = streamOut
    this.afterCallback = afterCallback
    this.cp = null
  }

  start () {
    var options = this.options
    // Capture audio stream
    var cmd, cmdArgs, cmdOptions
    switch (options.recorder) {
      // On some Windows machines, sox is installed using the "sox" binary
      // instead of "rec"
      case 'sox':
        var cmd = 'sox';
        var cmdArgs = [
          '-q',                     // show no progress
          '-t', 'waveaudio',        // audio type
          '-d',                     // use default recording device
          '-r', options.sampleRate, // sample rate
          '-c', options.channels,   // channels
          '-e', 'signed-integer',   // sample encoding
          '-b', '16',               // precision (bits)
          '-',                      // pipe
          // end on silence
          'silence', '1', '0.1', options.thresholdStart || options.threshold + '%',
          '1', options.silence, options.thresholdEnd || options.threshold + '%'
        ];
        break
      case 'rec':
      default:
        cmd = options.recorder
        cmdArgs = [
          '-q',                     // show no progress
          '-r', options.sampleRate, // sample rate
          '-c', options.channels,   // channels
          '-e', 'signed-integer',   // sample encoding
          '-b', '16',               // precision (bits)
          '-t', 'wav',              // audio type
          '-',                      // pipe
           //end on silence
          'silence', '1', '0.1', options.thresholdStart || options.threshold + '%',
          '1', options.silence, options.thresholdEnd || options.threshold + '%'
        ]
        break
      // On some systems (RasPi), arecord is the prefered recording binary
      case 'arecord':
        cmd = 'arecord'
        cmdArgs = [
          '-q',                     // show no progress
          '-r', options.sampleRate, // sample rate
          '-c', options.channels,   // channels
          '-t', 'wav',              // audio type
          '-f', 'S16_LE',           // Sample format
          '-'                       // pipe
        ]
        if (options.device) {
          cmdArgs.unshift('-D', options.device)
        }
        break
      case 'parec':
        cmd = 'parec'
        cmdArgs = [
          '--rate', options.sampleRate,   // sample rate
          '--channels', options.channels, // channels
          '--format', 's16le',            // sample format
        ]
        if (options.device) {
          cmdArgs.unshift('--device', options.device)
        }
        break
    }

    // Spawn audio capture command
    cmdOptions = { encoding: 'binary', shell: true}
    if (options.device) {
      cmdOptions.env = Object.assign({}, process.env, { AUDIODEV: options.device })
    }
    this.cp = spawn(cmd, cmdArgs, cmdOptions)
    this.cp.stderr.on('data', (data) => {
      var dataToString = data.toString()
      if (dataToString.search("WARN" > -1)) {
        return console.log("[ASSISANT:REC] WARN: " + data.toString())
      } else {
        this.stream.destroy()
        return this.afterCallback(data.toString())
      }
    })
    this.cp.on("exit", (code,signal)=>{
      this.stream.destroy()
      this.afterCallback(null, code)
    })

    this.stream = this.cp.stdout
    log(
      'Start listening',
      options.channels,
      'channels, use',
      options.recorder,
      'with sample rate',
      options.sampleRate,
    )

    this.stream.on('close', () => {
     log('Stop listening')
    })

    this.stream.pipe(this.streamOut)
  }

  stop () {
    if (!this.cp) {
      log('STOP is called without STARTING')
      return false
    }
    this.stream.unpipe(this.streamOut)
    this.cp.kill("SIGTERM") // Exit the spawned process, exit gracefully
    this.options = null
    this.streamOut = null
  }
}

module.exports = LPCM16
