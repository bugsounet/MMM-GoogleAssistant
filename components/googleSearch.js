"use strict";
var logGA = (...args) => { /* do nothing */ };
const google  = require("buscar.io");

class GoogleSearch {
  constructor (Tools, debug) {
    if (debug) logGA = (...args) => { console.log("[GA] [GoogleSearch]", ...args); };
    this.sendSocketNotification = (...args) => Tools.sendSocketNotification(...args);
    this.options = {
      page: 0,
      safe: true,
      parse_ads: false,
      additional_params: {
        //hl: 'fr-FR'
      }
    };
  }

  search (text) {
    if (!text) return;
    var finalResult = [];
    google.search(text, this.options)
      .then((response) => {
        console.log(response);
        if (response.results && response.results.length) {
          response.results.forEach((result) => {
            logGA("Link:", result.url);
            finalResult.push(result.url);
          });

          if (finalResult.length) {
            logGA("Results:", finalResult);
            this.sendSocketNotification("GOOGLESEARCH-RESULT", finalResult[0]);
          } else {
            logGA("No Results found!");
            this.sendSocketNotification("ERROR", "[GoogleSearch] No Results found!");
          }
        } else {
          logGA("No Results found!");
          this.sendSocketNotification("ERROR", "[GoogleSearch] No Results found!");
        }
      })
      .catch((e) => {
        console.error(`[GA] [GOOGLE_SEARCH] [ERROR] ${e}`);
        this.sendSocketNotification("ERROR", "[GoogleSearch] Sorry, an error occurred!");
      });
  }
}

module.exports = GoogleSearch;
