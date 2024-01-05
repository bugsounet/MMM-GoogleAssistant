var log = (...args) => { /* do nothing */ }

function create(that) {
  if (that.config.debug) log = (...args) => { console.log("[GA] [SMARTHOME] [DEVICE]", ...args) }
  log("Create device...")
  that.SmartHome.device = {
    "type": "action.devices.types.TV",
    "traits": [
      "action.devices.traits.Reboot",
      "action.devices.traits.InputSelector"
    ],
    "name": {
        "name": "Jarvis",
        "defaultNames": [
          "Jarvis",
          "MagicMirror",
          "Mirror"
        ],
        "nicknames": [
          "Jarvis",
          "MagicMirror",
          "Mirror"
        ]
    },
    "attributes": {
      "orderedInputs": true,
      "availableInputs": [
        {
          key: "Stop",
          names: [
            {
               lang: that.config.lang,
               name_synonym: [ "Stop", "stop" ]
            }
          ]
        }
      ]
    },
    "willReportState": true,
    "roomHint": "MMM-GoogleAssistant",
    "deviceInfo": {
        "manufacturer": "@bugsounet",
        "model": "MMM-GoogleAssistant",
        "hwVersion": require('../package.json').version,
        "swVersion": require('../package.json').rev
    }
  }

  setTimeout(() => {
    if (that.EXT.initialized) {
      log("Collecting all EXTs installed...")
      init(that)
    }
  }, 1000*30 )
}

function init(that) {
  if (that.config.debug) log = (...args) => { console.log("[GA] [SMARTHOME] [DEVICE]", ...args) }
  let GW = that.EXT.EXTStatus
  if (that.config.dev) log("Received first GW status", GW)
  that.SmartHome.EXT = {
    "EXT-Screen": GW["EXT-Screen"].hello,
    "EXT-Volume": GW["EXT-Volume"].hello,
    "EXT-Pages": GW["EXT-Pages"].hello,
    "EXT-Alert": GW["EXT-Alert"].hello,
    "EXT-Spotify": GW["EXT-Spotify"].hello,
    "EXT-SpotifyCanvasLyrics": GW["EXT-SpotifyCanvasLyrics"].hello,
    "EXT-FreeboxTV": GW["EXT-FreeboxTV"].hello
  }
  that.SmartHome.smarthome.Screen = GW["EXT-Screen"].power
  that.SmartHome.smarthome.Volume = GW["EXT-Volume"].speaker
  that.SmartHome.smarthome.VolumeIsMuted = GW["EXT-Volume"].isMuted
  that.SmartHome.smarthome.Page = GW["EXT-Pages"].actual
  that.SmartHome.smarthome.MaxPages = GW["EXT-Pages"].total
  that.SmartHome.smarthome.SpotifyIsConnected = GW["EXT-Spotify"].connected
  that.SmartHome.smarthome.SpotifyIsPlaying = GW["EXT-Spotify"].play
  that.SmartHome.smarthome.TvIsPlaying = GW["EXT-FreeboxTV"].connected
  that.SmartHome.smarthome.Lyrics = GW["EXT-SpotifyCanvasLyrics"].hello && (
    GW["EXT-SpotifyCanvasLyrics"].connected ? GW["EXT-SpotifyCanvasLyrics"].connected : (that.SmartHome.smarthome.SpotifyIsConnected && that.SmartHome.smarthome.SpotifyIsPlaying)
  )
  that.SmartHome.smarthome.LyricsIsForced = GW["EXT-SpotifyCanvasLyrics"].forced

  if (that.SmartHome.EXT["EXT-Screen"]) {
    log("Found: EXT-Screen (action.devices.traits.OnOff)")
    that.SmartHome.device.traits.push("action.devices.traits.OnOff")
  }
  if (that.SmartHome.EXT["EXT-Volume"]) {
    log("Found: EXT-Volume (action.devices.traits.Volume)")
    that.SmartHome.device.traits.push("action.devices.traits.Volume")
    that.SmartHome.device.attributes.volumeMaxLevel = 100
    that.SmartHome.device.attributes.volumeCanMuteAndUnmute = true
    that.SmartHome.device.attributes.volumeDefaultPercentage = that.SmartHome.smarthome.Volume
    that.SmartHome.device.attributes.levelStepSize = 5
  }
  if (that.SmartHome.EXT["EXT-Pages"]) {
    log("Found: EXT-Pages (action.devices.traits.InputSelector)")
    for (let i = 0; i < that.SmartHome.smarthome.MaxPages; i++) {
      log("Set: pages",i)
      let input = {}
      input.key = "page " + i
      input.names = []
      input.names[0] = {}
      input.names[0].lang = that.SmartHome.lang
      input.names[0].name_synonym = []
      input.names[0].name_synonym[0] = "page " + i
      that.SmartHome.device.attributes.availableInputs.push(input)
    }
  }
  if (that.SmartHome.EXT["EXT-Alert"]) {
    log("Found: EXT-Alert (action.devices.traits.Locator)")
    that.SmartHome.device.traits.push("action.devices.traits.Locator")
  }
  if (that.SmartHome.EXT["EXT-Spotify"]) {
    log("Found: EXT-Spotify (action.devices.traits.AppSelector, action.devices.traits.TransportControl)")
    that.SmartHome.device.traits.push("action.devices.traits.AppSelector")
    that.SmartHome.device.attributes.availableApplications = []
    let home = {
      "key": "home",
      "names": [
        {
          "name_synonym": [
            "home"
          ],
          "lang": that.SmartHome.lang
        }
      ]
    }
    let spotify = {
      "key": "spotify",
      "names": [
        {
          "name_synonym": [
            "spotify"
          ],
          "lang": that.SmartHome.lang
        }
      ]
    }
    that.SmartHome.device.attributes.availableApplications.push(home)
    that.SmartHome.device.attributes.availableApplications.push(spotify)
    that.SmartHome.device.traits.push("action.devices.traits.TransportControl")
    that.SmartHome.device.attributes.transportControlSupportedCommands = [
      "NEXT",
      "PAUSE",
      "PREVIOUS",
      "RESUME",
      "STOP"
    ]
  }

  if (that.SmartHome.EXT["EXT-FreeboxTV"]) {
    log("Found: EXT-FreeboxTV (action.devices.traits.Channel)")
    that.SmartHome.device.traits.push("action.devices.traits.Channel")
    let FBTV= {
      key: "EXT-FreeboxTV",
      names: [
        {
          lang: that.SmartHome.lang,
          name_synonym: [ "EXT-FreeboxTV" , "FreeboxTV", "Freebox TV" ]
        }
      ]
    }
    that.SmartHome.device.attributes.availableInputs.push(FBTV)
  }
  if (that.SmartHome.EXT["EXT-SpotifyCanvasLyrics"]) {
    log("Found: EXT-SpotifyCanvasLyrics (action.devices.traits.Channel)")
    that.SmartHome.device.traits.push("action.devices.traits.Channel")
    let SCL= {
      key: "EXT-SpotifyCanvasLyrics",
      names: [
        {
          lang: that.SmartHome.lang,
          name_synonym: [ "EXT-SpotifyCanvasLyrics" , "Lyrics", "Canvas" ]
        }
      ]
    }
    that.SmartHome.device.attributes.availableInputs.push(SCL)
  }
  if (that.config.dev) log("Your device is now:", that.SmartHome.device)
  if (that.SmartHome.homegraph) {
    that.lib.homegraph.requestSync(that)
  } else {
    console.log("[GA] [SMARTHOME] [DEVICE] HomeGraph is disabled.")
  }
  that.SmartHome.init = true
}

function refreshData(that) {
  let data = that.EXT.EXTStatus
  that.SmartHome.oldSmartHome = {
    Screen: that.SmartHome.smarthome.Screen,
    Volume: that.SmartHome.smarthome.Volume,
    VolumeIsMuted: that.SmartHome.smarthome.VolumeIsMuted,
    Page: that.SmartHome.smarthome.Page,
    MaxPages: that.SmartHome.smarthome.MaxPages,
    SpotifyIsConnected: that.SmartHome.smarthome.SpotifyIsConnected,
    SpotifyIsPlaying: that.SmartHome.smarthome.SpotifyIsPlaying,
    TvIsPlaying: that.SmartHome.smarthome.TvIsPlaying,
    Lyrics: that.SmartHome.smarthome.Lyrics,
    LyricsIsForced: that.SmartHome.smarthome.LyricsIsForced
  }
  that.SmartHome.smarthome.Screen = data["EXT-Screen"].power
  that.SmartHome.smarthome.Volume = data["EXT-Volume"].speaker
  that.SmartHome.smarthome.VolumeIsMuted = data["EXT-Volume"].isMuted
  that.SmartHome.smarthome.Page = data["EXT-Pages"].actual
  that.SmartHome.smarthome.MaxPages = data["EXT-Pages"].total
  that.SmartHome.smarthome.SpotifyIsConnected = data["EXT-Spotify"].connected
  that.SmartHome.smarthome.SpotifyIsPlaying = data["EXT-Spotify"].play
  that.SmartHome.smarthome.TvIsPlaying = data["EXT-FreeboxTV"].connected
  that.SmartHome.smarthome.Lyrics = data["EXT-SpotifyCanvasLyrics"].hello && (
    data["EXT-SpotifyCanvasLyrics"].connected ? data["EXT-SpotifyCanvasLyrics"].connected : (that.SmartHome.smarthome.SpotifyIsConnected && that.SmartHome.smarthome.SpotifyIsPlaying)
  )
  that.SmartHome.smarthome.LyricsIsForced = data["EXT-SpotifyCanvasLyrics"].forced
}

exports.create = create
exports.init = init
exports.refreshData = refreshData
