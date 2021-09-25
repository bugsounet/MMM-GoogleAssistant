const check = require("check-node-version");

check(
    { node: ">= 14.0", },
    (error, result) => {
        if (error) {
            console.error(error);
            return;
        }
        if (result.isSatisfied) {
          const minify = require('minify')
          const fs = require('fs')

          const files= [
           "../node_helper.js",
           "../MMM-GoogleAssistant.js",
           "../components/assistant.js",
           "../components/extented.js",
           "../components/long-press-event.js",
           "../components/response.js",
           "../components/screenParser.js",
           "../components/spotify.js",
           "../components/youtube.js",
           "../components/musicplayer.js"
          ]

          files.forEach(file => {
            new Promise(function(resolve) {
              minify(file)
                .then(data => {
                  console.log("Process File:", file)
              try {
                    fs.writeFileSync(file, data)
                  } catch(err) {
                console.error("Writing Error: " + err)
              }
              resolve()
              })
                .catch( error => {
                  console.log("File:", file, " -- Error Detected:", error)
                  resolve() // continue next file
                })
            })
          })
          return;
        }

        console.error("Warn: Master code optimization error!");
        console.error("Needed node >= 14.0");
        console.error("If you want to optimize really MMM-GoogleAssistant, you have use node v14.0 (or more)");
        console.error("Info: Don't worry, this step is not compulsory!")
    }
);
