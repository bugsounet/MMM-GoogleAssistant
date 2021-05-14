/** Youtube Library **/
/** bugsounet **/

/** Contructor(id,status,title):
 * @id: dom ID
 * @status: return --> true -> playing video/buffering or false -> in standby (unstarted/ended/paused)
 * @title: return title of the youtube video
 * @ended : return true when video finish (ended, paused or error)
****
 * function:
 * init(): intialize player
 * load(object):
    * { type: "id", id: <YT video id> } -> YT single video
    * { type: "playlist", id: <YT video id> } -> YT playlist video
 * command(command,param):
    * command and param to send from YT iframe API
****
**/
class YOUTUBE {
  constructor(id, status, title, ended, error) {
    this.idDom = id
    this.status = status
    this.title = title
    this.ended = ended
    this.error = error

    this.YTPlayer = null
    this.YTStarted = false
    this.list = false
    this.playerVars= {
      controls: 0,
      hl: config.language,
      enablejsapi: 1,
      rel: 0,
      cc_load_policy: 0,
      showinfo: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy:3,
      modestbranding: 1
    }

    this.state = {
      "-1": "Video unstarted",
      "0": "Video ended",
      "1": "Video playing",
      "2": "Video paused",
      "3": "Video buffering",
      "5": "Video cued"
    }

    this.err = {
      "2": "Invalid Parameter",
      "5": "HTML5 Player Error",
      "100": "Video Not Found (removed or privated)",
      "101": "Not Allowed By Owner",
      "150": "Not Allowed By Owner"
    }

    this.errorYT = false
    console.log("[GA:A2D] YOUTUBE Class Loaded")
  }

  init() {
    this.YTPlayer = new YT.Player(this.idDom, this.makeOptions())
    logA2D("YOUTUBE API is ready.")
  }

  makeOptions(options={}) {
    options.playerVars = Object.assign({}, this.playerVars)
    options.events = {}
    options.events.onReady = (ev) => {
      logA2D("YT Player is ready.")
    }
    options.events.onError = (ev) => {
      this.errorYT = true
      if (ev.data == "2") ev.target.stopVideo()
      console.log(`[GA:A2D] YT Error ${ev.data}:`, this.err[ev.data] ? this.err[ev.data] : "Unknown Error")
      if (this.error) this.error(`YouTube Error ${ev.data}: ` + (this.err[ev.data] ? this.err[ev.data] : "Unknown Error"))
      this.ended(true)
    }

    options.events.onPlaybackQualityChange = (ev) => {
      var playbackQuality = ev.data
      logA2D("YT Quality: " + playbackQuality)
    }

    options.events.onStateChange = (ev) => {
      switch(ev.data) {
        case 0:
        case 2:
          this.ended(true)
        case -1:
          this.status(false)
          break
        case 1:
          //A2D("!!! TEMP YT DEBUG !!!", this.YTPlayer)
          try {
            var title = this.YTPlayer.playerInfo.videoData ? this.YTPlayer.playerInfo.videoData.title : "unknow"
            logA2D("YT Playing Title:" , title)
            this.title(title)
          } catch (e) {
            logA2D("YT Playing Title: API Error", e)
          }
        case 3:
          this.status(true)
          break
        case 5:
          if (this.list) {
            var list = this.command("getPlaylist")
            if (!Array.isArray(list)) return false
            logA2D("YT Playlist count:", list.length)
          }
          if (!this.errorYT && this.YTStarted) this.command("playVideo")
          if (!this.YTStarted) {
            this.status(false)
            this.ended(true)
          }
          break
      }
      logA2D("YT Status:", this.state[ev.data])
    }
    return options
  }

  load(payload) {
    var option = {}
    var method = ""
    if (!payload) return false
    if (typeof payload.id == "undefined") return false
    else var id = payload.id
    this.list = false
    if (payload.type == "id") {
      option = {
        videoId: id
      }
      method = "cueVideoById"
    }
    else if (payload.type == "playlist") {
      option = {
        list: id,
        listType: "playlist",
        index: 0
      }
      method = "cuePlaylist"
      this.list = true
    } else return false
    this.YTStarted = true
    this.errorYT = false
    this.command(method, option)
  }

  command(cmd, param=null) {
    logA2D("YT Command:", cmd, param ? param : "")
    if (!this.YTPlayer || !cmd) return false
    if (typeof this.YTPlayer[cmd] == "function") {
      var ret = this.YTPlayer[cmd](param)
      if (cmd == "stopVideo") this.YTStarted = false
      if (ret && ret.constructor.name == "Y") ret = null
      return ret
    }
  }
}
