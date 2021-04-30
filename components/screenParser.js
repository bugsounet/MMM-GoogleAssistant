const HTMLParser = require("node-html-parser")
const path = require("path")
const fs = require("fs")
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

var _log = function() {
    var context = "[GA:SP]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class SCREENPARSER {
  constructor(config,debug) {
    this.config = config
    if (debug == true) log = _log
  }

  parse(response, endCallback=()=>{}) {
    if (response.screen) {
      var uri = this.config.screenOutputURI
      var filePath = path.resolve(__dirname, "..", uri)
      if (!response.screen.originalContent) return
      var str = response.screen.originalContent.toString("utf8")
      var disableTimeoutFromScreenOutput = (str) => {
        return str.replace(/document\.body,"display","none"/gim,(x)=>{
          return `document.body,"display","block"`
        })
      }
      str = disableTimeoutFromScreenOutput(str)

      var url = "/modules/MMM-GoogleAssistant/" + this.config.screenOutputCSS + "?seed=" + Date.now()
      str = str.replace(/<style>html,body[^<]+<\/style>/gmi, `<link rel="stylesheet" href="${url}">`)

      var ret = HTMLParser.parse(response.screen.originalContent)
      var dom = ret.querySelector(".popout-content").querySelector(".show_text_content")
      response.screen.text = dom ? dom.structuredText : null
      response.screen = this.parseScreenLink(response.screen)
      response.screen.photos = []
      var photos = ret.querySelectorAll(".photo_tv_image")
      if (photos) {
        for (var i=0; i < photos.length; i++) {
          response.screen.photos.push(photos[i].attributes["data-image-url"])
        }
      }

      var contents = fs.writeFile(filePath, str, (error) => {
        if (error) {
         log("CONVERSATION:SCREENOUTPUT_CREATION_ERROR", error)
         endCallback(error)
        } else {
          log("CONVERSATION:SCREENOUTPUT_CREATED")
          response.screen.path = filePath
          response.screen.uri = uri
          endCallback(response)
        }
      })
    }
  }

  parseScreenLink(screen) {
    var html = screen.originalContent
    screen.links = []
    var links = [
      /data-url=\"([^\"]+)\"/gmi,
      / (http[s]?\:\/\/[^ \)]+)[ ]?\)/gmi,
      /\: (http[s]?\:\/\/[^ <]+)/gmi,
    ]
    var r = null
    var res = []
    for (var i = 0; i < links.length; i++) {
      var link = links[i]
      while ((r = link.exec(html)) !== null) {
        res.push(entities.decode(r[1]))
      }
    }
    screen.links = res
    return screen
  }
}

module.exports = SCREENPARSER
