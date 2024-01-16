/** GoogleSearch
 * based from https://github.com/PatNeedham/google-it
 * recoded/simplified for my own use
 * @bugsounet 04/2023
**/

const cheerio = require( "cheerio")

class GoogleSearch {
  constructor() {
    var logGA = (...args) => { /* do nothing */ }
    this.defaultUserAgent = "Mozilla/5.0 (Linux x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 MMM-GoogleAssistant/"+require('../package.json').version;

    this.defaultLimit = 5
    this.defaultStart = 0
    this.linkSelector = 'div.fP1Qef > div:nth-child(1) > a'

    this.parseGoogleSearchResultUrl = (url) => {
      if (!url) return undefined
      if (url.charAt(0) === '/') {
        const searchURL= new URLSearchParams(url);
        return searchURL.get("url")
      }
      return url
    }
  }

  getResults({ data }) {
    const $ = cheerio.load(data)
    let results = []

    $(this.linkSelector).map((index, elem) => {
      const link = this.parseGoogleSearchResultUrl(elem.attribs.href)
      if (link.startsWith('http://www.google.com') || link.startsWith('https://www.google.com')) return
      results.push({ link: link })
    })

    return { results }
  }

  getResponse({ query }) {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({ q: query, num: this.defaultLimit, start: this.defaultStart })
      fetch(`https://www.google.com/search?${params}`,
        {
          "headers": {
            'User-Agent': this.defaultUserAgent,
          }
        })
        .then(async response => {
          const body = await response.text()
          const status = response.status
          return resolve({ body, status })
        })
        .catch((error) => reject(new Error(`[GA] [GoogleSearch] Error making web request:`, error)))
    })
  }

  googleIt(config) {
    return new Promise((resolve, reject) => {
      this.getResponse(config).then(({ body, status }) => {
        const { results } = this.getResults({ data: body })
        if (results.length === 0 && status !== 200) reject(new Error(`[GA] [GoogleSearch] Error in response: status ${status}.`))
        return resolve(results)
      }).catch(reject)
    })
  }

  search (that, text) {
    if (!text) return
    if (that.config.debug) logGA = (...args) => { console.log("[GA] [GoogleSearch]", ...args) }
    var finalResult = []
    this.googleIt({ query: text })
      .then(results => {
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
      })
      .catch(e => {
        console.error("[GA] [GOOGLE_SEARCH] [ERROR] " + e)
        that.sendSocketNotification("ERROR", "[GoogleSearch] Sorry, an error occurred!")
      })
  }
};

module.exports = GoogleSearch
