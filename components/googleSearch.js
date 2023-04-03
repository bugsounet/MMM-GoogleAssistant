/** GoogleSearch
 * based from https://github.com/PatNeedham/google-it
 * recoded/simplified for my own use
 * @bugsounet 04/2023
**/

class GoogleSearch {
  constructor(lib) {
    this.lib = lib
    this.defaultUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:34.0) Gecko/20100101 Firefox/34.0';

    this.defaultLimit = 10
    this.defaultStart = 0

    this.getDefaultRequestOptions = ({ limit, query, userAgent, start }) => (
      {
        url: 'https://www.google.com/search',
        params: {
          q: query,
          num: limit || this.defaultLimit,
          start: start || this.defaultStart,
        },
        headers: {
          'User-Agent': userAgent || this.defaultUserAgent,
        }
      }
    )

    this.linkSelector = 'div.fP1Qef > div:nth-child(1) > a'

    this.getLinkSelector = (passedValue) => (passedValue || this.linkSelector)

    this.parseGoogleSearchResultUrl = (url) => {
      if (!url) return undefined
      if (url.charAt(0) === '/') {
        const searchURL= new URLSearchParams(url);
        return searchURL.get("url")
      }
      return url
    }
  }

  getResults({ data, linkSelector }) {
    const $ = this.lib.cheerio.load(data)
    let results = []

    $(this.getLinkSelector(linkSelector)).map((index, elem) => {
      const link = this.parseGoogleSearchResultUrl(elem.attribs.href)
      if (link.startsWith('http://www.google.com') || link.startsWith('https://www.google.com')) return
      results.push({ link: link })
    })

    return { results }
  }

  getResponse({ query, limit, userAgent, start }) {
    return new Promise((resolve, reject) => {
      const defaultOptions = this.getDefaultRequestOptions({ limit, query, userAgent, start })
      this.lib.axios({ ...defaultOptions })
        .then(response => {
          const body = response.data
          return resolve({ body, response })
        })
        .catch((error) => reject(new Error(`Error making web request: ${error}`)))
    })
  }

  googleIt(config) {
    const { linkSelector, start } = config
    return new Promise((resolve, reject) => {
      this.getResponse(config).then(({ body, response }) => {
        const { results } = this.getResults({
          data: body,
          linkSelector,
          start
        })
        const { status } = response

        if (results.length === 0 && status !== 200) reject(new Error(`Error in response: status ${status}.`))

        return resolve(results)
      }).catch(reject)
    })
  }
};

module.exports = GoogleSearch
