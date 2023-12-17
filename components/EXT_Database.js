/** Create EXT database **/

class EXT_Database {
  constructor () {
    console.log("[GA] EXT_Database Ready")
  }

  ExtDB() {
    let db = [
      "EXT-Alert",
      "EXT-Background",
      "EXT-Bard",
      "EXT-Bring",
      "EXT-Browser",
      "EXT-Detector",
      "EXT-FreeboxTV",
      "EXT-GooglePhotos",
      "EXT-Governor",
      "EXT-Internet",
      "EXT-Keyboard",
      "EXT-Librespot",
      "EXT-MusicPlayer",
      "EXT-Motion",
      "EXT-Pages",
      "EXT-Photos",
      "EXT-Pir",
      "EXT-RadioPlayer",
      "EXT-Screen",
      "EXT-Selfies",
      "EXT-SelfiesFlash",
      "EXT-SelfiesSender",
      "EXT-SelfiesViewer",
      "EXT-Spotify",
      "EXT-SpotifyCanvasLyrics",
      "EXT-StreamDeck",
      "EXT-TelegramBot",
      "EXT-Updates",
      "EXT-Volume",
      "EXT-Welcome",
      "EXT-YouTube",
      "EXT-YouTubeCast"
    ]
    return db
  }
  
  async createDB(that) {
    let EXT = {
      GA_Ready: false
    }
  
    await Promise.all(that.ExtDB.map(Ext=> {
      EXT[Ext] = {
        hello: false,
        connected: false
      }
    }))
  
    /** special rules **/
    EXT["EXT-Motion"].started = false
    EXT["EXT-Pir"].started = false
    EXT["EXT-Screen"].power = true
    EXT["EXT-Updates"].update = {}
    EXT["EXT-Updates"].npm = {}
    EXT["EXT-Spotify"].remote = false
    EXT["EXT-Spotify"].play = false
    EXT["EXT-Volume"].speaker = 0
    EXT["EXT-Volume"].isMuted = false
    EXT["EXT-Volume"].recorder = 0
    EXT["EXT-SpotifyCanvasLyrics"].forced = false
    EXT["EXT-Pages"].actual = 0
    EXT["EXT-Pages"].total = 0
    return EXT
  }
}
  
