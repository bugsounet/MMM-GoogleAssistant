const path = require("path");
const fs = require("fs");

console.log("~MMM-GoogleAssistant~ Migrate smarthome from v5 to v6~");
console.log("~~This script is only need if you use Gateway and SmartHome fonctionality with MMM-GoogleAssistant v5~~\n");

function checkGateway () {
  return new Promise((resolve, reject) => {
    let Package = path.resolve(__dirname, "../../Gateway/package.json");
    if (!fs.existsSync(Package)) reject("Gateway not found!");
    let Gateway = require(Package);
    if (Gateway.name !== "Gateway") reject("Gateway not found!");
    console.log(`[GA] Detected Gateway v${Gateway.version} rev: ${Gateway.rev}`);
    resolve(true);
  });
}

function checkCredentials () {
  return new Promise((resolve, reject) => {
    let credentialsFile = path.resolve(__dirname, "../../Gateway/credentials.json");
    if (!fs.existsSync(credentialsFile)) reject("credentials.json not found. Migrate is not needed.");
    let credentials = require(credentialsFile);
    if (credentials.type !== "service_account") reject("Wrong credentials.json file");
    console.log("[GA] Detected Gateway credentials.json file");
    resolve(true);
  });
}

function copyCredentials () {
  return new Promise((resolve, reject) => {
    console.log("[GA] Copy credentials from Gateway to MMM-GoogleAssistant");
    let GatewayCredentials = path.resolve(__dirname, "../../Gateway/credentials.json");
    let GACredentials = path.resolve(__dirname, "../smarthome.json");
    fs.copyFile(GatewayCredentials, GACredentials, fs.constants.COPYFILE_EXCL, (err) => {
      if (err) reject(err);
      else {
        console.log("[GA] New credentials smarthome.json was copied to MMM-GoogleAssistant folder");
        resolve(true);
      }
    });
  });
}

function copyTokens () {
  return new Promise((resolve, reject) => {
    console.log("[GA] Copy any tokens from Gateway to MMM-GoogleAssistant");
    let GatewayTokens = path.resolve(__dirname, "../../Gateway/tokens/");
    let GATokens = path.resolve(__dirname, "../website/tokens/");
    fs.cp(GatewayTokens, GATokens, { recursive: true }, (err) => {
      if (err) reject(err);
      else {
        console.log("[GA] All smarthome tokens was copied to MMM-GoogleAssistant/website/tokens folder");
        resolve(true);
      }
    });
  });
}

function checkConfig () {
  return new Promise((resolve, reject) => {
    console.log("[GA] Check config.js file of MagicMirror");
    let configPath = path.resolve(__dirname, "../../../config/config.js");
    if (!fs.existsSync(configPath)) reject("Config.js not found!");
    let config = require(configPath);
    let found = 0;
    let missing = 0;
    let GWConfig = {
      username: null,
      password: null,
      CLIENT_ID: null
    };
    let GAConfig = {
      website: {
        username: null,
        password: null,
        CLIENT_ID: null
      }
    };
    config.modules.forEach((module) => {
      if (module.module === "Gateway") {
        if (module.config.username) GWConfig.username = module.config.username;
        else {
          console.warn("[GA] No username found");
          missing++;
        }
        if (module.config.password) GWConfig.password = module.config.password;
        else {
          console.warn("[GA] No password found");
          missing++;
        }
        if (module.config.CLIENT_ID) GWConfig.CLIENT_ID = module.config.CLIENT_ID;
        else {
          console.warn("[GA] No CLIENT_ID found");
          missing++;
        }
        if (missing) reject("Do you really use smarthome ? there is to many missing things");
        found++;
      }
    });
    if (!found) reject("No Gateway config found!");
    console.log("[GA] Found Gateway config:", GWConfig);
    found = 0;
    let GAModuleConfig = {};
    config.modules.forEach((module) => {
      if (module.module === "MMM-GoogleAssistant") {
        GAModuleConfig = module;
        if (module.config.website === undefined) GAModuleConfig.config.website = {};
        GAModuleConfig.config.website = {};
        GAModuleConfig.config.website.username = GWConfig.username;
        GAModuleConfig.config.website.password = GWConfig.password;
        GAModuleConfig.config.website.CLIENT_ID = GWConfig.CLIENT_ID;
        found++;
      }
    });
    if (!found) reject("No MMM-GoogleAssistant config found!");
    console.log("[GA] This is your new config of MMM-GoogleAssistant for using smarthome:\n");
    console.log(GAModuleConfig);
    resolve();
  });
}

function catchError (error) {
  console.error("\n");
  console.error(`[GA] [Error] ${error}`);
  console.error("\n");
  process.exit();
}

function launchCheckGateway () {
  checkGateway()
    .then((result) => launchCheckCredentials())
    .catch((error) => catchError(error));
}

function launchCheckCredentials () {
  checkCredentials()
    .then((result) => launchCopyCredentials())
    .catch((error) => catchError(error));
}

function launchCopyCredentials () {
  copyCredentials()
    .then((result) => launchCopyTokens())
    .catch((error) => catchError(error));
}

function launchCopyTokens () {
  copyTokens()
    .then((result) => launchCheckConfig())
    .catch((error) => catchError(error));
}

function launchCheckConfig () {
  checkConfig()
    .then((result) => console.log("\nHappy use!"))
    .catch((error) => catchError(error));
}

launchCheckGateway();
