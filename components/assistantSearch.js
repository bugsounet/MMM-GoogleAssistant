/* assistant Search Database */
/* rev: 230227 */
/* fr-FR @bugsounet
 * en-US @bugsounet
 * --
 * beta:
 * de-DE
 * it-IT
 */

/* global logGA */

class AssistantSearch {
  constructor (config) {
    logGA("AssistantSearch for", config.lang);
    var GoogleSearchDB = {
      // de (maybe to complete)
      "de-DE": [
        "Im Internet habe ich das hier gefunden",
        "Unter anderem gibt es das hier im Internet",
        "Dazu habe ich Folgendes gefunden",
        "Das Top‐Ergebnis im Internet sagt dazu Folgendes",
        "Hier ist das Top‐Suchergebnis aus dem Netz",
        "Ich habe unter anderem das hier gefunden"
      ],
      // it (maybe to complete)
      "it-IT": [
        "Questo è ciò che ho trovato.",
        "Ecco cos'ho trovato.",
        "Ecco, ho trovato questo risultato.",
        "Ecco cosa ho trovato sul web."
      ],
      // fr
      "fr-FR": [
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
      "en-US": [
        // en
        "Here's what I found",
        "Here's the top search result",
        "Here's what I found on the web",
        "Here's a result from search",
        "Here's a result from the web",
        "This is the top result",
        "This came back from a search",
        "this came back from google",
        "here's some info",
        // nl
        "Dit heb ik op internet gevonden",
        "Dit is het beste resultaat",
        "Dit heb ik gevonden",
        "Hier het beste zoekresultaat",
        "Hier is het beste zoekresultaat",
        "Hier is een resultaat",
        "Hier is een zoekresultaat",
        "Ik heb dit gevonden over je zoekopdracht"
      ]
    };
    var YouTubeSearchDB = {
      // de (maybe to complete)
      "de-DE": [
        "Hier sind Informationen von YouTube",
        "Hier ist ein passendes Ergebnis von YouTube",
        "Hier ist das Top‐Ergebnis. Es kommt von YouTube",
        "Hier ist eine Antwort von YouTube",
        "Bei YouTube hab ich Folgendes gefunden",
        "Bei YouTube hab ich das hier gefunden",
        "YouTube hat dieses Ergebnis"
      ],
      // it (maybe to complete)
      "it-IT": [
        "Ho trovato questo risultato su YouTube",
        "Ecco cos'ho trovato su YouTube.",
        "Ecco un risultato da YouTube."
      ],
      // fr
      "fr-FR": [
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
      "en-US": [
        // en
        "YouTube has this result",
        "This came back from YouTube",
        "This is from YouTube",
        "Here's a matching YouTube result",
        "Here's a result from YouTube",
        "Here's an answer from YouTube",
        "Here's a YouTube result",
        "Here's the top YouTube result",
        "Here's something from YouTube",
        "I found this on YouTube",
        // nl
        "Dit is het beste resultaat",
        "Hier is het beste zoekresultaat",
        "Dit heb ik gevonden",
        "Dit zijn de beste resultaten",
        "Hier zijn een paar zoekresultaten",
        "Hier is een resultaat",
        "Hier is een zoekresultaat"
      ]
    };
    this.GoogleDB = GoogleSearchDB[config.lang];
    this.YouTubeDB = YouTubeSearchDB[config.lang];
    if (this.GoogleDB) {
      this.GoogleDB = this.GoogleDB.map((text) => text.toLowerCase());
      logGA("AssistantSearch Google: Loaded");
    }
    else console.warn("[GA] AssistantSearch Google: lang not found!");
    if (this.YouTubeDB) {
      this.YouTubeDB = this.YouTubeDB.map((text) => text.toLowerCase());
      logGA("AssistantSearch YouTube: Loaded");
    }
    else console.warn("[GA] AssistantSearch YouTube: lang not found!");
  }

  GoogleSearch (text) {
    if (!this.GoogleDB) return false;
    if (this.GoogleDB.includes(text.toLowerCase())) {
      logGA("GoogleDB Found:", text);
      return true;
    }
    else return false;
  }

  YouTubeSearch (text) {
    if (!this.YouTubeDB) return false;
    if (this.YouTubeDB.includes(text.toLowerCase())) {
      logGA("YouTubeDB Found:", text);
      return true;
    }
    else return false;
  }
}
