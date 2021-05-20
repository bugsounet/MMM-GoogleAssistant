/** Testing script **/
/** @bugsounet/cvlc **/

var Cvlc = require('@bugsounet/cvlc')
var link ="https://www.youtube.com/watch?v=25N1pdzvp4c"

console.log("Try to start VLC...")
var args = ["--no-http-forward-cookies", "--no-video-title-show", "--no-video-deco", "--no-embedded-video", "--video-title=library @bugsounet/cvlc Testing Windows"]
var test = 0
var VolMin,VolMed,VolMax,full,win,pause,play,restart,end
this.stream = new Cvlc(args)
self=this

this.stream.play(
  link,
  ()=> {
    console.log("Test YouTube link:", link)
    testVLC()
  },
  ()=> {
    console.log("Video is now ended\n")
    clearTimeout(volMin)
    clearTimeout(volMed)
    clearTimeout(volMax)
    clearTimeout(full)
    clearTimeout(win)
    clearTimeout(pause)
    clearTimeout(play)
    clearTimeout(restart)
    clearTimeout(end)
    if (!test) console.error("Error Detected!\n")

    console.log("If You have some trouble with this sample script code:\n\n")
    console.log("Are you sure that you use this script in a terminal in the RPI desktop ?\n\n")
    console.log("In other case, you have solutions, try this:\n")
    console.log(" * 1: enable OPEN GL accelerator with raspi-config and retry this script\n")
    console.log(" * 2: try to make a full update of your RPI with this commands:\n")
    console.log("      sudo apt-get update")
    console.log("      sudo apt-get upgrade")
    console.log("      sudo apt-get dist-upgrade\n")
    console.log("  and retry this script\n")
    console.log(" * 3: Open VLC Program from the RPI Desktop")
    console.log("      navigate to Tools > Preferency > Video")
    console.log("      output > choose another output")
    console.log("      close VLC Program and restart this script\n")
    console.log(" * 4: Choose another OPEN GL driver and retry solution #3")
  }
)

function testVLC() {
  volMin= setTimeout(() => {
    console.log("Volume control 0%")
    self.stream.cmd("volume 0")
  }, 3000)
  volMed= setTimeout(() => {
    console.log("Volume control 50%")
    self.stream.cmd("volume 128")
  }, 6000)
  volMax= setTimeout(() => {
    console.log("Volume control 100%")
    self.stream.cmd("volume 255")
  }, 9000)
  full=setTimeout(() => {
    console.log("Test Fullscreen")
    self.stream.cmd("fullscreen on")
  }, 12000)
  win=setTimeout(() => {
    console.log("Test Back to Windows")
    self.stream.cmd("fullscreen off")
  }, 15000)
  pause=setTimeout(() => {
    console.log("Test Pause")
    self.stream.cmd("pause")
  }, 18000)
  play=setTimeout(() => {
    console.log("Test Play")
    self.stream.cmd("play")
  }, 21000)
  restart=setTimeout(() => {
    console.log("Test Restart")
    self.stream.cmd("prev")
  }, 27000)
  end=setTimeout(() => {
    console.log("All Test Done!")
    test=1
    self.stream.destroy()
  }, 30000)
}
