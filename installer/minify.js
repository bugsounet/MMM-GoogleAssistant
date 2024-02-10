/** Code minifier **/
/** @busgounet **/

const { globSync } = require('glob')
const path = require('path')
const esbuild = require("esbuild")

var files = [
  "../" + require("../package.json").main,
  "../node_helper.js"
]

let project = require("../package.json").name
let revision = require("../package.json").rev
let version =  require("../package.json").version
let commentIn  = "/**"
let commentOut = "**/"

function searchFiles() {
  let components = globSync('../components/*.js')
  let AssistantSDK = globSync('../components/AssistantSDK/*.js')
  files = files.concat(components)
  files = files.concat(AssistantSDK)
  console.log("Found: " + files.length + " files to minify\n")
}

// minify files array
async function minifyFiles() {
  searchFiles()
  await Promise.all(files.map(file => { return minify(file) })).catch(() => process.exit(255))
}

function minify(file) {
  let pathResolve = path.resolve(__dirname, file)
  let FileName = path.parse(file).base
  let error = 0
  console.log("Process File:", file)
  return new Promise((resolve,reject) => {
    try {
      esbuild.buildSync({
        entryPoints: [pathResolve],
        allowOverwrite: true,
        minify: true,
        outfile: pathResolve,
        banner: {
         js: `${commentIn} ${project}\n  * File: ${FileName}\n  * Version: ${version}\n  * Revision: ${revision}\n${commentOut}`
        },
        footer: {
          js: `${commentIn} Coded With Heart by bugsounet ${commentOut}`
        }
      })
      resolve(true)
    } catch (e) {
      reject()
    }
  })
}

minifyFiles()
