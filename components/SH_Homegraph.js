/** homegraph **/

var log = () => { /* do nothing */ }

function init(that) {
  if (that.config.debug) log = (...args) => { console.log("[GA] [SMARTHOME] [HOMEGRAPH]", ...args) }
  let file = that.lib.path.resolve(__dirname, "../smarthome.json")
  that.lib.fs.readFile(file, 'utf8', (err, data) => {
    let content
    if (!data) {
      console.error("[GA] [SMARTHOME] [HOMEGRAPH] credentials.json: file not found!")
      that.lib.callback.send(that, "Alert", "[HOMEGRAPH] Hey! credentials.json: file not found!")
      return
    }
    try {
      content = JSON.parse(data)
    } catch (e) {
      console.error("[GA] [SMARTHOME] [HOMEGRAPH] credentials.json: corrupt!")
      that.lib.callback.send(that, "Alert", "[HOMEGRAPH] credentials.json: corrupt!")
      return
    }
    if (content.type && content.type == "service_account") {
      that.SmartHome.homegraph = that.lib.googleapis.google.homegraph({
        version: 'v1',
        auth: new that.lib.GoogleAuthLibrary.GoogleAuth({
          keyFile: file,
          scopes: ['https://www.googleapis.com/auth/homegraph']
        })
      })
    } else {
      console.error("[GA] [SMARTHOME] [HOMEGRAPH] credentials.json: bad format!")
      that.lib.callback.send(that, "Alert", "[HOMEGRAPH] credentials.json: bad format!")
    }
  })
}

async function requestSync(that) {
  if (!that.SmartHome.homegraph) return
  log("[RequestSync] in Progress...")
  let body = {
    requestBody: {
      agentUserId: that.SmartHome.user.user,
      async: false
    }
  }
  try {
    const res = await that.SmartHome.homegraph.devices.requestSync(body)
    console.log("[GA] [SMARTHOME] Ready!")
  } catch (e) {
    if (e.code) {
      console.error("[GA] [SMARTHOME] [HOMEGRAPH] [RequestSync] Error:", e.code , e.errors)
      that.lib.callback.send(that, "Alert", "[requestSync] Error " + e.code + " - " + e.errors[0].message +" ("+ e.errors[0].reason +")")
    } else {
      console.error("[GA] [SMARTHOME] [HOMEGRAPH] [RequestSync]", e.toString())
      that.lib.callback.send(that, "Alert", "[requestSync] " + e.toString())
    }
  }
}

async function queryGraph(that) {
  if (!that.SmartHome.homegraph) return
  let query = {
    requestBody: {
      requestId: "GA-"+Date.now(),
      agentUserId: that.SmartHome.user.user,
      inputs: [
        {
          payload: {
            devices: [
              {
                id: "MMM-GoogleAssistant"
              }
            ]
          }
        }
      ]
    }
  }
  try { 
    const res = await that.SmartHome.homegraph.devices.query(query)
    log("[QueryGraph]", JSON.stringify(res.data))
  } catch (e) { 
    console.log("[GA] [SMARTHOME] [HOMEGRAPH] [QueryGraph]", e.code ? e.code : e, e.errors? e.errors : "")
  }
}

async function updateGraph(that) {
  if (!that.SmartHome.homegraph) return
  let EXT = that.SmartHome.EXT
  let current = that.SmartHome.smarthome
  let old = that.SmartHome.oldSmartHome

  if (!that.lib._.isEqual(current, old)) {
    let state = {
      online: true
    }
    if (EXT["EXT-Screen"]) {
      state.on = current.Screen
    }
    if (EXT["EXT-Volume"]) {
      state.currentVolume = current.Volume
      state.isMuted = current.VolumeIsMuted
    }
    if (EXT["EXT-FreeboxTV"] && current.TvIsPlaying) {
      state.currentInput = "EXT-FreeboxTV"
    } else if (EXT["EXT-SpotifyCanvasLyrics"] && current.Lyrics) {
      state.currentInput = "EXT-SpotifyCanvasLyrics"
    } else if (EXT["EXT-Pages"]) {
      state.currentInput = "page " + current.Page
    }
    if (EXT["EXT-Spotify"]) {
      state.currentApplication = current.SpotifyIsConnected ? "spotify" : "home"
    }
    let body = {
      requestBody: {
        agentUserId: that.SmartHome.user.user,
        requestId: "GA-"+Date.now(),
        payload: {
          devices: {
            states: {
              "MMM-GoogleAssistant": state
            }
          }
        }
      }
    }
    try {
      const res = await that.SmartHome.homegraph.devices.reportStateAndNotification(body)
      if (res.status != 200) log("[ReportState]", res.data, state, res.status, res.statusText)
    } catch (e) {
      console.error("[GA] [SMARTHOME] [HOMEGRAPH] [ReportState]", e.code ? e.code : e, e.errors? e.errors : "")
    }
  }
}
  
exports.init = init
exports.requestSync = requestSync
exports.queryGraph = queryGraph
exports.updateGraph = updateGraph
