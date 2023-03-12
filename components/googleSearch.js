"use strict"

var logGA = (...args) => { /* do nothing */ }

function search (that, text) {
  if (!text) return
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [GOOGLE_SEARCH]", ...args) }
  var finalResult = []
  that.lib.googleIt(
    {
      query: text,
      disableConsole: true,
      limit: 5,
      "only-urls": true
    }
  ).then(results => {
    if (results && results.length) {
      results.forEach(link => {
        if (link.link.startsWith('http://www.google.com') || link.link.startsWith('https://www.google.com')) {
          logGA("ADS:", link.link)
        } else {
          logGA("Link:", link.link)
          finalResult.push(link.link)
        }
      })
      logGA("Results:",finalResult)
      that.sendSocketNotification("GOOGLESEARCH-RESULT", finalResult[0])
    } else {
      logGA("No Results found!")
      that.sendSocketNotification("ERROR", "[GoogleSearch] No Results found!")
    }
  }).catch(e => {
    console.error("[GA][ERROR][GoogleSearch] " + e)
    that.sendSocketNotification("ERROR", "[GoogleSearch] Sorry, an error occurred")
  })
} 

exports.search = search
