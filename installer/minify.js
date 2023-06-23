/** Code minifier v1.2 **/
/** 2023/02/28 **/
/** @busgounet **/

const check = require("check-node-version")
const fs = require('fs')
const { globSync } = require('glob')

var files = [
  "../" + require("../package.json").main,
  "../node_helper.js",
]

function searchFiles() {
  let components = globSync('../components/*.js')
  files = files.concat(components)
  console.log("Found: " + files.length + " files to minify\n")
}

// import minify
async function loadMinify() {
  const loaded = await import('minify')
  return loaded
}

// minify files array
async function minifyFiles() {
  const {minify} = await loadMinify()
  searchFiles()
  files.forEach(file => {
    new Promise(resolve => {
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
}

minifyFiles()
