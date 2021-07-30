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
 "../components/youtube.js"
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
