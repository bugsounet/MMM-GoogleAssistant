"use strict"

var logGA = (...args) => { /* do nothing */ }

function search (that, text) {
  if (!text) return
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [GOOGLE_SEARCH]", ...args) }
  var finalResult = []
  that.searchOnGoogle.googleIt(
    {
      userAgent: "Mozilla/5.0 (Linux x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 MMM-GoogleAssistant/"+require('../package.json').version,
      query: text,
      limit: 5,
      start: 0
    }
  ).then(results => {
    if (results && results.length) {
      results.forEach(link => {
        logGA("Link:", link.link)
        finalResult.push(link.link)
      })

      if (finalResult.length) {
        logGA("Results:",finalResult)
        that.sendSocketNotification("GOOGLESEARCH-RESULT", finalResult[0])
      } else {
        logGA("No Results found!")
        that.sendSocketNotification("ERROR", "[GoogleSearch] No Results found!")
      }
    } else {
      logGA("No Results found!")
      that.sendSocketNotification("ERROR", "[GoogleSearch] No Results found!")
    }
  }).catch(e => {
    console.error("[GA] [GOOGLE_SEARCH] [ERROR] " + e)
    that.sendSocketNotification("ERROR", "[GoogleSearch] Sorry, an error occurred!")
  })
}

exports.search = search
