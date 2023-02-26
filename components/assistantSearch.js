/* assistant Search Database */

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
        "Un résultat de recherche"
      ],
      // en
      "en-US": [
        "here's a result from search",
        "here's a result from the web",
        "here's the top search result",
        "this came back from google",
        "this came back from a search",
        "here's what i found on the web",
        "this is the top result",
        "here's what i found",
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
      ]
    }
    this.GoogleDB = GoogleSearchDB[config.lang]
    this.YouTubeDB = YouTubeSearchDB[config.lang]
    if (this.GoogleDB) logGA("AssistantSearch Google: Loaded")
    else console.warn("[GA] AssistantSearch Google: lang not found!")
    if (this.YouTubeDB) logGA("AssistantSearch YouTube: Loaded")
    else console.warn("[GA] AssistantSearch YouTube: lang not found!")
  }

  GoogleSearch(text) {
    if (!this.GoogleDB) return false
    if (this.GoogleDB.includes(text)) {
      logGA("GoogleDB Found:", text)
      return true
    }
    else return false
  }

  YouTubeSearch(text) {
    if (!this.YouTubeDB) return false
    if (this.YouTubeDB.includes(text)) {
      logGA("YouTubeDB Found:", text)
      return true
    }
    else return false
  }
}
