"use strict";
const { exec } = require("child_process");
const fs = require("fs");

function checkConfigDeepMerge () {
  let file = `${global.root_path}/config/config.js`;
  let GAPath = `${global.root_path}/modules/MMM-GoogleAssistant`;
  let MMConfig;
  return new Promise((resolve) => {
    console.log("[GA] [SECURE] Check digital footprint...");
    exec(`cd ${GAPath} && git config --get remote.origin.url`, (e, so, se) => {
      if (e) {
        console.log("[GA] [SECURE] Unknow error!");
        process.exit(1);
      }
      let output = new RegExp("bugs");
      if (!output.test(so)) {
        fs.rm(GAPath, { recursive: true, force: true }, () => {
          console.warn("[GA] [SECURE] Open your fridge, take a beer and try again...");
          process.exit(1);
        });
      } else {
        console.log("[GA] [SECURE] Happy use !");

        if (fs.existsSync(file)) MMConfig = require(file);
        else {
          console.error("[GA] [CONFIG] [FATAL] MagicMirror config not found!");
          process.exit(1);
        }
        let configModule = MMConfig.modules.find((m) => m.module === "MMM-GoogleAssistant");
        if (!configModule.configDeepMerge) {
          console.error("[GA] [CONFIG_MERGE] [FATAL] MMM-GoogleAssistant Module Configuration Error: ConfigDeepMerge is not actived !");
          console.error("[GA] [CONFIG_MERGE] Please review your MagicMirror config.js file!");
          process.exit(1);
        } else {
          console.log("[GA] [CONFIG_MERGE] Perfect ConfigDeepMerge activated!");
          resolve();
        }
      }
    });
  });
}

exports.checkConfigDeepMerge = checkConfigDeepMerge;
