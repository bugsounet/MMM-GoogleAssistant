/** Actions On Google **/

var log = (...args) => { /* do nothing */ }
const SHTools = require("../components/SH_Tools.js")
const callback = require("../components/SH_Callbacks.js")

function actions (that) {
  if (that.config.debug) log = (...args) => { console.log("[GA] [SMARTHOME] [ACTIONS]", ...args) }

  that.SmartHome.actions.onSync((body, headers) => {
    log("[SYNC] Request:", JSON.stringify(body))
    let user_id = SHTools.check_token(that,headers)
    if (!user_id) {
      console.error("[GA] [SMARTHOME] [ACTIONS] [SYNC] Error: user_id not found!")
      return {} // maybe return error ??
    }
    var result = {}
    result["requestId"] = body["requestId"]
    result['payload'] = {"agentUserId": user_id, "devices": []}
    let user = SHTools.get_userOnly(that,user_id)
    let device = SHTools.get_device(user.devices[0], that.SmartHome.device)
    result['payload']['devices'].push(device)
    log("[SYNC] Send Result:", JSON.stringify(result))
    return result
  })

  that.SmartHome.actions.onExecute((body, headers) => {
    log("[EXECUTE] Request:", JSON.stringify(body))
    let user_id = SHTools.check_token(that,headers)
    if (!user_id) {
      console.error("[GA] [SMARTHOME] [ACTIONS] [EXECUTE] Error: user_id not found!")
      return {} // maybe return error ??
    }
    var result = {}
    result['payload'] = {}
    result['payload']['commands'] = []
    let inputs = body["inputs"]
    let device_id = inputs[0].payload.commands[0].devices[0].id || null
    let command = inputs[0].payload.commands[0].execution[0].command || null
    let params = inputs[0].payload.commands[0].execution[0].hasOwnProperty("params") ? inputs[0].payload.commands[0].execution[0].params : null
    let action_result = execute(that, command, params)
    action_result['ids'] = [device_id]
    result['payload']['commands'].push(action_result)
    log("[EXECUTE] Send Result:", JSON.stringify(result))
    return result
  })

  that.SmartHome.actions.onQuery((body, headers) => {
    log("[QUERY] Request:", JSON.stringify(body))
    let user_id = SHTools.check_token(that,headers)
    if (!user_id) {
      console.error("[GA] [SMARTHOME] [ACTIONS] [QUERY] Error: user_id not found!")
      return {} // maybe return error ??
    }
    var result = {}
    result['payload'] = {}
    result['payload']['devices'] = {}
    let inputs = body["inputs"]
    let device_id = inputs[0].payload.devices[0].id || null
    log("[QUERY] device_id:", device_id)
    result['payload']['devices'][device_id] = query(that.SmartHome)
    log("[QUERY] Send Result:", JSON.stringify(result))
    return result
  })

  that.SmartHome.actions.onDisconnect((body, headers) => {
    log("[Disconnect]")
    SHTools.delete_token(that, SHTools.get_token(headers))
    return {}
  })
}

function query(SmartHome) {
  let data = SmartHome.smarthome
  let EXT = SmartHome.EXT
  let result = { "online": true }

  if (!SmartHome.init) {
    result = { "online": false }
    log("[QUERY] Result:", result)
    return result
  }

  if (EXT["EXT-Screen"]) {
    result.on = data.Screen
  }
  if (EXT["EXT-Volume"]) {
    result.currentVolume = data.Volume
    result.isMuted = data.VolumeIsMuted
  }
  if (EXT["EXT-FreeboxTV"] && data.TvIsPlaying) {
    result.currentInput = "EXT-FreeboxTV"
  } else if (EXT["EXT-SpotifyCanvasLyrics"] && data.Lyrics) {
    result.currentInput = "EXT-SpotifyCanvasLyrics"
  } else if (EXT["EXT-Pages"]) {
    result.currentInput = "page " + data.Page
  }
  if (EXT["EXT-Spotify"]) {
    result.currentApplication = data.SpotifyIsConnected ? "spotify" : "home"
  }
  log("[QUERY] Result:", result)
  return result
}

function execute(that, command, params) {
  let data = that.SmartHome.smarthome
  switch (command) {
    case "action.devices.commands.OnOff":
      if (params['on']) callback.send(that, "screen", "ON")
      else callback.send(that, "screen", "OFF")
      return {"status": "SUCCESS", "states": {"on": params['on'], "online": true}}
      break
    case "action.devices.commands.volumeRelative":
      let level = 0
      if (params.volumeRelativeLevel > 0) {
        level = data.Volume +5
        if (level > 100) level = 100
        callback.send(that, "volumeUp")
      } else {
        level = data.Volume -5
        if (level < 0) level = 0
        callback.send(that, "volumeDown")
      }
      return {"status": "SUCCESS", "states": {"online": true, "currentVolume": level, "isMuted": data.VolumeIsMuted}}
      break
    case "action.devices.commands.setVolume":
      callback.send(that, "volume" ,params.volumeLevel)
      return {"status": "SUCCESS", "states": {"online": true, "currentVolume": params.volumeLevel, "isMuted": data.VolumeIsMuted}}
      break
    case "action.devices.commands.mute":
      callback.send(that, "volumeMute", params.mute)
      return {"status": "SUCCESS", "states": { "online": true, "isMuted": params.mute, "currentVolume": data.Volume}}
      break
    case "action.devices.commands.SetInput":
      log("SetInput", params)
      let input = params.newInput.split(" ")
      if (input == "Stop") {
        callback.send(that, "Stop")
        params.newInput = "page " + data.Page
      } else if (input == "EXT-FreeboxTV") {
        callback.send(that, "TVPlay")
        params.newInput = input
      } else if (input == "EXT-SpotifyCanvasLyrics") {
        if (!data.LyricsIsForced && !data.Lyrics) callback.send(that, "SpotifyLyricsOn")
        else if (data.LyricsIsForced) {
          callback.send(that, "SpotifyLyricsOff")
        }
        if (!data.SpotifyIsPlaying) callback.send(that, "SpotifyPlay")
        params.newInput = input
      } else {
        callback.send(that,"setPage",input[1])
      }
      return {"status": "SUCCESS", "states": { "online": true , "currentInput": params.newInput}}
      break
    case "action.devices.commands.NextInput":
      callback.send(that, "setNextPage")
      return {"status": "SUCCESS", "states": { "online": true }}
      break
    case "action.devices.commands.PreviousInput":
      callback.send(that, "setPreviousPage")
      return {"status": "SUCCESS", "states": { "online": true }}
      break
    case "action.devices.commands.Reboot":
      callback.send(that, "Reboot")
      return {}
      break
    case "action.devices.commands.Locate":
      callback.send(that, "Locate")
      return {"status": "SUCCESS"}
      break
    case "action.devices.commands.mediaStop":
      callback.send(that, "Stop")
      return {}
      break
    case "action.devices.commands.mediaNext":
      callback.send(that, "SpotifyNext")
      return {}
      break
    case "action.devices.commands.mediaPrevious":
      callback.send(that, "SpotifyPrevious")
      return {}
      break
    case "action.devices.commands.mediaPause":
      if (data.SpotifyIsPlaying) callback.send(that, "SpotifyPause")
      return {}
      break
    case "action.devices.commands.mediaResume":
      if (!data.SpotifyIsPlaying) callback.send(that, "SpotifyPlay")
      return {}
      break
    case "action.devices.commands.appSelect":
      if (params.newApplication == "spotify") {
        if (!data.SpotifyIsConnected && !data.SpotifyIsPlaying) {
          callback.send(that,"SpotifyPlay")
        }
      }
      return { "status": "SUCCESS", "states": { "online": true, "currentApplication": params.newApplication }}
      break
    case "action.devices.commands.relativeChannel":
      if (params.relativeChannelChange > 0) {
        callback.send(that, "TVNext")
      } else {
        callback.send(that, "TVPrevious")
      }
      return {"status": "SUCCESS" }
      break
    default:
      return {"status": "ERROR"}
      break
  }
}

exports.actions = actions
