/** Code minifier **/
/** @busgounet **/

const { globSync } = require('glob')
const path = require('path')
const esbuild = require("esbuild")

var files = [
  "../" + require("../package.json").main,
  "../node_helper.js"
]

function searchFiles() {
  let components = globSync('../components/*.js')
  files = files.concat(components)
  console.log("Found: " + files.length + " files to minify\n")
}

// minify files array
async function minifyFiles() {
  searchFiles()
  await Promise.all(files.map(file => { return minify(file) })).catch(() => process.exit(255))
}

function minify(file) {
  let pathResolve = path.resolve(__dirname, file)
  let error = 0
  console.log("Process File:", file)
  return new Promise((resolve,reject) => {
    try {
      esbuild.buildSync({
        entryPoints: [pathResolve],
        allowOverwrite: true,
        minify: true,
        outfile: pathResolve
      })
      resolve(true)
    } catch (e) {
      reject()
    }
  })
}

minifyFiles()
