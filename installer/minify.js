/*
 * Code minifier
 * @busgounet
*/

const path = require("path");
const { globSync } = require("glob");
const esbuild = require("esbuild");

var files = [
  `../${require("../package.json").main}`,
  "../node_helper.js"
];

let project = require("../package.json").name;
let revision = require("../package.json").rev;
let version = require("../package.json").version;

let commentIn = "/**";
let commentOut = "**/";

/**
 * search all javascript files
 */
function searchFiles () {
  let components = globSync("../components/*.js");
  files = files.concat(components);
  console.log(`Found: ${files.length} files to minify\n`);
}

/**
 * Minify all files in array with Promise
 */
async function minifyFiles () {
  searchFiles();
  await Promise.all(files.map((file) => { return minify(file); })).catch(() => process.exit(255));
}

/**
 * Minify filename with esbuild
 * @param {string} file to minify
 * @returns {boolean} resolved with true
 */
function minify (file) {
  let pathResolve = path.resolve(__dirname, file);
  let FileName = path.parse(file).base;
  let error = 0;
  console.log("Process File:", file);
  return new Promise((resolve, reject) => {
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
      });
      resolve(true);
    } catch (e) {
      reject();
    }
  });
}

minifyFiles();
