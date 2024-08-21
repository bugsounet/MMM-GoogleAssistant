const path = require("path");
const { spawn } = require("child_process");
const { readdirSync } = require("fs");
const Spinner = require("cli-spinner").Spinner;
const pressAnyKey = require("press-any-key");

const resolved = path.resolve(__dirname, "../..");
const Directories = getDirectories(resolved);

var skip = 0;
var updated = 0;
var failed = 0;
var total = Directories.length -1;

console.log("Start Refreshing and Updating MMM-GoogleAssistant and EXTs\n");
main();

function getDirectories (source) {
  const directories = readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  return directories;
}

function Update (module) {
  return new Promise((resolve) => {
    console.log("❤ Found:", module);
    const modulePath = `${resolved}/${module}`;
    var command = "npm run clean && npm run update";

    const spinner = new Spinner(`Updating: ${module}...`);
    spinner.setSpinnerString(18);
    spinner.start();
    const updateModule = spawn(command, { cwd: modulePath, shell: true });

    updateModule.stdout.on("data", (data) => {

      /* For debug
      process.stdout.write('\r');
      console.log(data.toString());
      */
    });

    updateModule.stderr.on("data", (data) => {
      console.error(`\n❗ ${data.toString()}`);
    });

    updateModule.on("exit", (code) => {
      spinner.stop();
      process.stdout.write("\r");
      if (!code) {
        let version = require(`${modulePath}/package.json`).version;
        let rev = require(`${modulePath}/package.json`).rev;
        console.log(`✅ Update of ${module}: Version: ${version} (${rev})`);
        console.log("---");
        updated++;
        resolve();
      } else {
        console.error("❌ Failed: Error Detected!");
        failed++;
        pressAnyKey("Press any key to continue, or CTRL+C to exit", {
          ctrlC: "reject"
        })
          .then(() => {
            console.log("---");
            resolve();
          })
          .catch(() => {
            Result();
            process.exit();
          });
      }
    });
  });
}

async function main () {
  for (const module of Directories) {
    if (module.startsWith("EXT-") || module === "MMM-GoogleAssistant") {
      await Update(module);
    } else {
      if (module === "default") continue;
      else {
        console.log("✋ Skipped:", module);
        console.log("---");
        skip++;
      }
    }
  }
  Result();
}

function Result () {
  console.log("\n✌ Result:");
  console.log(`➤ Updated: ${updated}/${total}`);
  console.log(`➤ Failed: ${failed}/${total}`);
  console.log(`➤ Skipped: ${skip}/${total}`);
  console.log("🛠️ For personalized assistance, visit https://www.bugsounet.fr and create a ticket.");
}
