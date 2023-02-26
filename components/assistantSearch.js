/* assistant Search Database */
/* rev: 230226 */
/* fr-FR
 * en-US
 */

class AssistantSearch {
  constructor (config) {
    logGA("AssistantSearch for", config.lang)
    var GoogleSearchDB = {
      // fr
      "fr-FR" : [
        "Voici le premier résultat de recherche",
        "Voici ce que j'ai trouvé",
        "Voilà un résultat venant du Web",
        "Voilà ce que nous donne une recherche rapide",
        "Je vous donne le premier résultat",
        "Une recherche nous donne ce résultat",
        "Voilà ce que j'ai trouvé",
        "Sur le Web, on trouve ce résultat",
        "Un résultat de recherche",
        "Ceci vient du Web"
      ],
      // en
      "en-US": [
        "Here's what I found",
        "Here's the top search result",
        "Here's what I found on the web",
        "Here's a result from search",
        "Here's a result from the web",
        "This is the top result",
        "This came back from a search",
        "this came back from google",
        "here's some info"
      ]
    }
    var YouTubeSearchDB = {
      // fr
      "fr-FR" : [
        "Voilà ce que propose YouTube",
        "Voici un résultat provenant de YouTube",
        "J'ai trouvé ça sur YouTube",
        "Voilà ce que YouTube propose",
        "Voilà un résultat de YouTube",
        "Voici les meilleurs résultats de YouTube",
        "Voici les premiers résultats de YouTube",
        "Voici quelques éléments trouvés sur YouTube",
        "Voilà des éléments tirés de YouTube",
        "YouTube propose ce résultat"
      ],
      // en
      "en-US": [
        "YouTube has this result",
        "This came back from YouTube",
        "This is from YouTube",
        "Here's a matching YouTube result",
        "Here's a result from YouTube",
        "Here's an answer from YouTube",
        "Here's a YouTube result",
        "Here's the top YouTube result",
        "Here's something from YouTube",
        "I found this on YouTube"
      ]
    }
    this.GoogleDB = GoogleSearchDB[config.lang]
    this.YouTubeDB = YouTubeSearchDB[config.lang]
    if (this.GoogleDB) {
      this.GoogleDB = this.GoogleDB.map(text => text.toLowerCase())
      logGA("AssistantSearch Google: Loaded")
    }
    else console.warn("[GA] AssistantSearch Google: lang not found!")
    if (this.YouTubeDB) {
      this.YouTubeDB = this.YouTubeDB.map(text => text.toLowerCase())
      logGA("AssistantSearch YouTube: Loaded")
    }
    else console.warn("[GA] AssistantSearch YouTube: lang not found!")
  }

  GoogleSearch(text) {
    if (!this.GoogleDB) return false
    if (this.GoogleDB.includes(text.toLowerCase())) {
      logGA("GoogleDB Found:", text)
      return true
    }
    else return false
  }

  YouTubeSearch(text) {
    if (!this.YouTubeDB) return false
    if (this.YouTubeDB.includes(text.toLowerCase())) {
      logGA("YouTubeDB Found:", text)
      return true
    }
    else return false
  }
}