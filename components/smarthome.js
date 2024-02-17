"use strict";

var logGA = (...args) => { /* do nothing */ };
const fs = require("fs");
const googleapis = require("googleapis");
const GoogleAuthLibrary = require("google-auth-library");
const GoogleActions = require("actions-on-google");
const express = require("express");
const _ = require("lodash");

class smarthome {
  constructor (config, cb = () => {}) {
    this.website = config.website;
    this.config = config.config;
    this.language = config.lang;
    this.sendSocketNotification = (...args) => cb.sendSocketNotification(...args);
    this.restart = () => cb.restart();

    if (config.debug) logGA = (...args) => { console.log("[GA] [SMARTHOME]", ...args); };

    this.SmartHome = {
      lang: "en",
      use: false,
      init: false,
      last_code: null,
      last_code_user: null,
      last_code_time: null,
      user: { user: "admin", password: "admin", devices: ["MMM-GoogleAssistant"] },
      actions: null,
      device: {},
      EXT: {},
      smarthome: {},
      oldSmartHome: {},
      homegraph: null
    };
    this.root_path = global.root_path;
    this.GAPath = `${this.root_path}/modules/MMM-GoogleAssistant`;
    this.WebsitePath = `${this.GAPath}/website`;
    this.SmartHomePath = `${this.WebsitePath}/SmartHome`;
    this.tokensDir = `${this.WebsitePath}/tokens/`;
    this.waitBeforeInitDevice = 10 * 1000;
  }

  async init () {
    console.log("[GA] Loading smarthome...");
    this.SmartHome.lang = this.SHLanguage(this.language);
    this.SmartHome.use = true;
    this.SmartHome.user.user = this.config.username;
    this.SmartHome.user.password = this.config.password;

    let file = `${this.GAPath}/smarthome.json`;
    fs.readFile(file, "utf8", (err, data) => {
      let content;
      if (!data) {
        console.error("[GA] [SMARTHOME] [HOMEGRAPH] smarthome.json: file not found!");
        this.send("Alert", "[HOMEGRAPH] smarthome.json: file not found!");
        return;
      }
      try {
        content = JSON.parse(data);
      } catch (e) {
        console.error("[GA] [SMARTHOME] [HOMEGRAPH] smarthome.json: corrupt!");
        this.send("Alert", "[HOMEGRAPH] smarthome.json: corrupt!");
        return;
      }
      if (content.type && content.type === "service_account") {
        this.SmartHome.homegraph = googleapis.google.homegraph({
          version: "v1",
          auth: new GoogleAuthLibrary.GoogleAuth({
            keyFile: file,
            scopes: ["https://www.googleapis.com/auth/homegraph"]
          })
        });
      } else {
        console.error("[GA] [SMARTHOME] [HOMEGRAPH] smarthome.json: bad format!");
        this.send("Alert", "[HOMEGRAPH] smarthome.json: bad format!");
      }
    });


    this.createDevice();
    await this.createSmartHome();

    logGA("Wait", this.waitBeforeInitDevice / 1000, "secs for Collecting EXTs...");

    setTimeout(() => {
      if (this.website.website.initialized) {
        console.log("[GA] [SMARTHOME] Device Configuration...");
        this.initDevice();
      }
    }, this.waitBeforeInitDevice);
  }

  /** create SmartHome Website **/
  createSmartHome () {
    return new Promise((resolve) => {
      this.SmartHome.actions = GoogleActions.smarthome();

      var options = {
        dotfiles: "ignore",
        etag: false,
        extensions: ["css", "js"],
        index: false,
        maxAge: "1d",
        redirect: false,
        setHeaders (res) {
          res.set("x-timestamp", Date.now());
        }
      };

      logGA("Create SmartHome needed routes...");

      this.actions();
      this.website.website.app

        /** OAuth2 Server **/
        .use("/smarthome/assets", express.static(`${this.WebsitePath}/assets`, options))
        .get("/smarthome/login/", (req, res) => {
          if (this.SmartHome.init) res.sendFile(`${this.SmartHomePath}/login.html`);
          else res.sendFile(`${this.SmartHomePath}/disabled.html`);
        })

        .post("/smarthome/login/", (req, res) => {
          let form = req.body;
          let args = req.query;
          if (form["username"] && form["password"] && args["state"] && args["response_type"] && args["response_type"] === "code" && args["client_id"] === this.config.CLIENT_ID) {
            let user = this.get_user(form["username"], form["password"]);
            if (!user) return res.sendFile("this.SmartHomePath}/login.html");
            this.SmartHome.last_code = this.random_string(8);
            this.SmartHome.last_code_user = form["username"];
            this.SmartHome.last_code_time = (new Date(Date.now())).getTime() / 1000;
            let params = {
              state: args["state"],
              code: this.SmartHome.last_code,
              client_id: this.config.CLIENT_ID
            };
            logGA("[AUTH] Generate Code:", this.SmartHome.last_code);
            res.status(301).redirect(args["redirect_uri"] + this.serialize(params));
          } else {
            res.status(400).sendFile(`${this.SmartHomePath}/400.html`);
          }
        })

        .post("/smarthome/token/", (req, res) => {
          let form = req.body;
          if (form["grant_type"] && form["grant_type"] === "authorization_code" && form["code"] && form["code"] === this.SmartHome.last_code) {
            let time = (new Date(Date.now())).getTime() / 1000;
            if (time - this.SmartHome.last_code_time > 10) {
              logGA("[TOKEN] Invalid code (timeout)");
              res.status(403).sendFile(`${this.SmartHomePath}/403.html`);
            } else {
              let access_token = this.random_string(32);
              fs.writeFileSync(`${this.tokensDir}/${access_token}`, this.SmartHome.last_code_user, { encoding: "utf8" });
              logGA("|TOKEN] Send Token:", access_token);
              res.json({ access_token: access_token });
            }
          } else {
            logGA("[TOKEN] Invalid code");
            res.status(403).sendFile(`${this.SmartHomePath}/403.html`);
          }
        })

        /** fulfillment Server **/
        .get("/smarthome/", (req, res) => {
          res.sendFile(`${this.SmartHomePath}/works.html`);
        })

        .post("/smarthome/", this.SmartHome.actions)

        /** Display current google graph in console **/
        .get("/smarthome/graph", (req, res) => {
          if (this.SmartHome.homegraph) this.queryGraph();
          res.status(404).sendFile(`${this.SmartHomePath}/404.html`);
        });
      resolve();
    });
  }

  /** Device **/
  createDevice () {
    logGA("[DEVICE] Create device...");
    this.SmartHome.device = {
      type: "action.devices.types.TV",
      traits: [
        "action.devices.traits.Reboot",
        "action.devices.traits.InputSelector"
      ],
      name: {
        name: "Jarvis",
        defaultNames: [
          "Jarvis",
          "MagicMirror",
          "Mirror"
        ],
        nicknames: [
          "Jarvis",
          "MagicMirror",
          "Mirror"
        ]
      },
      attributes: {
        orderedInputs: true,
        availableInputs: [
          {
            key: "Stop",
            names: [
              {
                lang: this.SmartHome.lang,
                name_synonym: ["Stop", "stop"]
              }
            ]
          }
        ]
      },
      willReportState: true,
      roomHint: "MMM-GoogleAssistant",
      deviceInfo: {
        manufacturer: "@bugsounet",
        model: "MMM-GoogleAssistant",
        hwVersion: require("../package.json").version,
        swVersion: require("../package.json").rev
      }
    };
  }

  initDevice () {
    let GW = this.website.getEXTStatus();
    //logGA("Received first GW status", GW)
    this.SmartHome.EXT = {
      "EXT-Screen": GW["EXT-Screen"].hello,
      "EXT-Volume": GW["EXT-Volume"].hello,
      "EXT-Pages": GW["EXT-Pages"].hello,
      "EXT-Alert": GW["EXT-Alert"].hello,
      "EXT-Spotify": GW["EXT-Spotify"].hello,
      "EXT-SpotifyCanvasLyrics": GW["EXT-SpotifyCanvasLyrics"].hello,
      "EXT-FreeboxTV": GW["EXT-FreeboxTV"].hello
    };
    this.SmartHome.smarthome.Screen = GW["EXT-Screen"].power;
    this.SmartHome.smarthome.Volume = GW["EXT-Volume"].speaker;
    this.SmartHome.smarthome.VolumeIsMuted = GW["EXT-Volume"].isMuted;
    this.SmartHome.smarthome.Page = GW["EXT-Pages"].actual;
    this.SmartHome.smarthome.MaxPages = GW["EXT-Pages"].total;
    this.SmartHome.smarthome.SpotifyIsConnected = GW["EXT-Spotify"].connected;
    this.SmartHome.smarthome.SpotifyIsPlaying = GW["EXT-Spotify"].play;
    this.SmartHome.smarthome.TvIsPlaying = GW["EXT-FreeboxTV"].connected;
    this.SmartHome.smarthome.Lyrics = GW["EXT-SpotifyCanvasLyrics"].hello && (
      GW["EXT-SpotifyCanvasLyrics"].connected ? GW["EXT-SpotifyCanvasLyrics"].connected : (this.SmartHome.smarthome.SpotifyIsConnected && this.SmartHome.smarthome.SpotifyIsPlaying)
    );
    this.SmartHome.smarthome.LyricsIsForced = GW["EXT-SpotifyCanvasLyrics"].forced;

    if (this.SmartHome.EXT["EXT-Screen"]) {
      logGA("[DEVICE] Found: EXT-Screen (action.devices.traits.OnOff)");
      this.SmartHome.device.traits.push("action.devices.traits.OnOff");
    }
    if (this.SmartHome.EXT["EXT-Volume"]) {
      logGA("[DEVICE] Found: EXT-Volume (action.devices.traits.Volume)");
      this.SmartHome.device.traits.push("action.devices.traits.Volume");
      this.SmartHome.device.attributes.volumeMaxLevel = 100;
      this.SmartHome.device.attributes.volumeCanMuteAndUnmute = true;
      this.SmartHome.device.attributes.volumeDefaultPercentage = this.SmartHome.smarthome.Volume;
      this.SmartHome.device.attributes.levelStepSize = 5;
    }
    if (this.SmartHome.EXT["EXT-Pages"]) {
      logGA("[DEVICE] Found: EXT-Pages (action.devices.traits.InputSelector)");
      for (let i = 0; i < this.SmartHome.smarthome.MaxPages; i++) {
        logGA("Set: pages", i);
        let input = {};
        input.key = `page ${i}`;
        input.names = [];
        input.names[0] = {};
        input.names[0].lang = this.SmartHome.lang;
        input.names[0].name_synonym = [];
        input.names[0].name_synonym[0] = `page ${i}`;
        this.SmartHome.device.attributes.availableInputs.push(input);
      }
    }
    if (this.SmartHome.EXT["EXT-Alert"]) {
      logGA("[DEVICE] Found: EXT-Alert (action.devices.traits.Locator)");
      this.SmartHome.device.traits.push("action.devices.traits.Locator");
    }
    if (this.SmartHome.EXT["EXT-Spotify"]) {
      logGA("[DEVICE] Found: EXT-Spotify (action.devices.traits.AppSelector, action.devices.traits.TransportControl)");
      this.SmartHome.device.traits.push("action.devices.traits.AppSelector");
      this.SmartHome.device.attributes.availableApplications = [];
      let home = {
        key: "home",
        names: [
          {
            name_synonym: ["home"],
            lang: this.SmartHome.lang
          }
        ]
      };
      let spotify = {
        key: "spotify",
        names: [
          {
            name_synonym: ["spotify"],
            lang: this.SmartHome.lang
          }
        ]
      };
      this.SmartHome.device.attributes.availableApplications.push(home);
      this.SmartHome.device.attributes.availableApplications.push(spotify);
      this.SmartHome.device.traits.push("action.devices.traits.TransportControl");
      this.SmartHome.device.attributes.transportControlSupportedCommands = [
        "NEXT",
        "PAUSE",
        "PREVIOUS",
        "RESUME",
        "STOP"
      ];
    }

    if (this.SmartHome.EXT["EXT-FreeboxTV"]) {
      logGA("[DEVICE] Found: EXT-FreeboxTV (action.devices.traits.Channel)");
      this.SmartHome.device.traits.push("action.devices.traits.Channel");
      let FBTV = {
        key: "EXT-FreeboxTV",
        names: [
          {
            lang: this.SmartHome.lang,
            name_synonym: ["EXT-FreeboxTV", "FreeboxTV", "Freebox TV"]
          }
        ]
      };
      this.SmartHome.device.attributes.availableInputs.push(FBTV);
    }
    if (this.SmartHome.EXT["EXT-SpotifyCanvasLyrics"]) {
      logGA("[DEVICE] Found: EXT-SpotifyCanvasLyrics (action.devices.traits.Channel)");
      this.SmartHome.device.traits.push("action.devices.traits.Channel");
      let SCL = {
        key: "EXT-SpotifyCanvasLyrics",
        names: [
          {
            lang: this.SmartHome.lang,
            name_synonym: ["EXT-SpotifyCanvasLyrics", "Lyrics", "Canvas"]
          }
        ]
      };
      this.SmartHome.device.attributes.availableInputs.push(SCL);
    }
    //logGA("Your device is now:", this.SmartHome.device)
    if (this.SmartHome.homegraph) {
      this.requestSync();
    } else {
      console.log("[GA] [SMARTHOME] [DEVICE] HomeGraph is disabled.");
    }
    this.SmartHome.init = true;
  }

  refreshData () {
    let data = this.website.getEXTStatus();
    this.SmartHome.oldSmartHome = {
      Screen: this.SmartHome.smarthome.Screen,
      Volume: this.SmartHome.smarthome.Volume,
      VolumeIsMuted: this.SmartHome.smarthome.VolumeIsMuted,
      Page: this.SmartHome.smarthome.Page,
      MaxPages: this.SmartHome.smarthome.MaxPages,
      SpotifyIsConnected: this.SmartHome.smarthome.SpotifyIsConnected,
      SpotifyIsPlaying: this.SmartHome.smarthome.SpotifyIsPlaying,
      TvIsPlaying: this.SmartHome.smarthome.TvIsPlaying,
      Lyrics: this.SmartHome.smarthome.Lyrics,
      LyricsIsForced: this.SmartHome.smarthome.LyricsIsForced
    };
    this.SmartHome.smarthome.Screen = data["EXT-Screen"].power;
    this.SmartHome.smarthome.Volume = data["EXT-Volume"].speaker;
    this.SmartHome.smarthome.VolumeIsMuted = data["EXT-Volume"].isMuted;
    this.SmartHome.smarthome.Page = data["EXT-Pages"].actual;
    this.SmartHome.smarthome.MaxPages = data["EXT-Pages"].total;
    this.SmartHome.smarthome.SpotifyIsConnected = data["EXT-Spotify"].connected;
    this.SmartHome.smarthome.SpotifyIsPlaying = data["EXT-Spotify"].play;
    this.SmartHome.smarthome.TvIsPlaying = data["EXT-FreeboxTV"].connected;
    this.SmartHome.smarthome.Lyrics = data["EXT-SpotifyCanvasLyrics"].hello && (
      data["EXT-SpotifyCanvasLyrics"].connected ? data["EXT-SpotifyCanvasLyrics"].connected : (this.SmartHome.smarthome.SpotifyIsConnected && this.SmartHome.smarthome.SpotifyIsPlaying)
    );
    this.SmartHome.smarthome.LyricsIsForced = data["EXT-SpotifyCanvasLyrics"].forced;
  }

  /** action on google **/
  actions () {
    this.SmartHome.actions.onSync((body, headers) => {
      logGA("[ACTIONS] [SYNC] Request:", JSON.stringify(body));
      let user_id = this.check_token(headers);
      if (!user_id) {
        console.error("[GA] [SMARTHOME] [ACTIONS] [SYNC] Error: user_id not found!");
        return {}; // maybe return error ??
      }
      var result = {};
      result["requestId"] = body["requestId"];
      result["payload"] = { agentUserId: user_id, devices: [] };
      let user = this.get_userOnly(user_id);
      let device = this.get_device(user.devices[0], this.SmartHome.device);
      result["payload"]["devices"].push(device);
      logGA("[ACTIONS] [SYNC] Send Result:", JSON.stringify(result));
      return result;
    });

    this.SmartHome.actions.onExecute((body, headers) => {
      logGA("[ACTIONS] [EXECUTE] Request:", JSON.stringify(body));
      let user_id = this.check_token(headers);
      if (!user_id) {
        console.error("[GA] [SMARTHOME] [ACTIONS] [EXECUTE] Error: user_id not found!");
        return {}; // maybe return error ??
      }
      var result = {};
      result["payload"] = {};
      result["payload"]["commands"] = [];
      let inputs = body["inputs"];
      let device_id = inputs[0].payload.commands[0].devices[0].id || null;
      let command = inputs[0].payload.commands[0].execution[0].command || null;
      let params = inputs[0].payload.commands[0].execution[0].hasOwnProperty("params") ? inputs[0].payload.commands[0].execution[0].params : null;
      let action_result = this.execute(command, params);
      action_result["ids"] = [device_id];
      result["payload"]["commands"].push(action_result);
      logGA("[ACTIONS] [EXECUTE] Send Result:", JSON.stringify(result));
      return result;
    });

    this.SmartHome.actions.onQuery((body, headers) => {
      logGA("[ACTIONS] [QUERY] Request:", JSON.stringify(body));
      let user_id = this.check_token(headers);
      if (!user_id) {
        console.error("[GA] [SMARTHOME] [ACTIONS] [QUERY] Error: user_id not found!");
        return {}; // maybe return error ??
      }
      var result = {};
      result["payload"] = {};
      result["payload"]["devices"] = {};
      let inputs = body["inputs"];
      let device_id = inputs[0].payload.devices[0].id || null;
      logGA("[ACTIONS] [QUERY] device_id:", device_id);
      result["payload"]["devices"][device_id] = this.query(this.SmartHome);
      logGA("[ACTIONS] [QUERY] Send Result:", JSON.stringify(result));
      return result;
    });

    this.SmartHome.actions.onDisconnect((body, headers) => {
      logGA("[ACTIONS] [Disconnect]");
      this.delete_token(this.get_token(headers));
      return {};
    });
  }

  query (SmartHome) {
    let data = SmartHome.smarthome;
    let EXT = SmartHome.EXT;
    let result = { online: true };

    if (!SmartHome.init) {
      result = { online: false };
      logGA("[HOMEGRAPH] [QUERY] Result:", result);
      return result;
    }

    if (EXT["EXT-Screen"]) {
      result.on = data.Screen;
    }
    if (EXT["EXT-Volume"]) {
      result.currentVolume = data.Volume;
      result.isMuted = data.VolumeIsMuted;
    }
    if (EXT["EXT-FreeboxTV"] && data.TvIsPlaying) {
      result.currentInput = "EXT-FreeboxTV";
    } else if (EXT["EXT-SpotifyCanvasLyrics"] && data.Lyrics) {
      result.currentInput = "EXT-SpotifyCanvasLyrics";
    } else if (EXT["EXT-Pages"]) {
      result.currentInput = `page ${data.Page}`;
    }
    if (EXT["EXT-Spotify"]) {
      result.currentApplication = data.SpotifyIsConnected ? "spotify" : "home";
    }
    logGA("[HOMEGRAPH] [QUERY] Result:", result);
    return result;
  }

  execute (command, params) {
    let data = this.SmartHome.smarthome;
    switch (command) {
      case "action.devices.commands.OnOff":
        if (params["on"]) this.send("screen", "ON");
        else this.send("screen", "OFF");
        return { status: "SUCCESS", states: { on: params["on"], online: true } };
      case "action.devices.commands.volumeRelative":
        var level = 0;
        if (params.volumeRelativeLevel > 0) {
          level = data.Volume + 5;
          if (level > 100) level = 100;
          this.send("volumeUp");
        } else {
          level = data.Volume - 5;
          if (level < 0) level = 0;
          this.send("volumeDown");
        }
        return { status: "SUCCESS", states: { online: true, currentVolume: level, isMuted: data.VolumeIsMuted } };
      case "action.devices.commands.setVolume":
        this.send("volume", params.volumeLevel);
        return { status: "SUCCESS", states: { online: true, currentVolume: params.volumeLevel, isMuted: data.VolumeIsMuted } };
      case "action.devices.commands.mute":
        this.send("volumeMute", params.mute);
        return { status: "SUCCESS", states: { online: true, isMuted: params.mute, currentVolume: data.Volume } };
      case "action.devices.commands.SetInput":
        var input = params.newInput.split(" ");
        if (input === "Stop") {
          this.send("Stop");
          params.newInput = `page ${data.Page}`;
        } else if (input === "EXT-FreeboxTV") {
          this.send("TVPlay");
          params.newInput = input;
        } else if (input === "EXT-SpotifyCanvasLyrics") {
          if (!data.LyricsIsForced && !data.Lyrics) this.send("SpotifyLyricsOn");
          else if (data.LyricsIsForced) {
            this.send("SpotifyLyricsOff");
          }
          if (!data.SpotifyIsPlaying) this.send("SpotifyPlay");
          params.newInput = input;
        } else {
          this.send("setPage", input[1]);
        }
        return { status: "SUCCESS", states: { online: true, currentInput: params.newInput } };
      case "action.devices.commands.NextInput":
        this.send("setNextPage");
        return { status: "SUCCESS", states: { online: true } };
      case "action.devices.commands.PreviousInput":
        this.send("setPreviousPage");
        return { status: "SUCCESS", states: { online: true } };
      case "action.devices.commands.Reboot":
        this.send("Reboot");
        return {};
      case "action.devices.commands.Locate":
        this.send("Locate");
        return { status: "SUCCESS" };
      case "action.devices.commands.mediaStop":
        this.send("Stop");
        return {};
      case "action.devices.commands.mediaNext":
        this.send("SpotifyNext");
        return {};
      case "action.devices.commands.mediaPrevious":
        this.send("SpotifyPrevious");
        return {};
      case "action.devices.commands.mediaPause":
        if (data.SpotifyIsPlaying) this.send("SpotifyPause");
        return {};
      case "action.devices.commands.mediaResume":
        if (!data.SpotifyIsPlaying) this.send("SpotifyPlay");
        return {};
      case "action.devices.commands.appSelect":
        if (params.newApplication === "spotify") {
          if (!data.SpotifyIsConnected && !data.SpotifyIsPlaying) {
            this.send("SpotifyPlay");
          }
        }
        return { status: "SUCCESS", states: { online: true, currentApplication: params.newApplication } };
      case "action.devices.commands.relativeChannel":
        if (params.relativeChannelChange > 0) {
          this.send("TVNext");
        } else {
          this.send("TVPrevious");
        }
        return { status: "SUCCESS" };
      default:
        return { status: "ERROR" };
    }
  }

  /** Tools **/
  get_user (username, password) {
    if ((username === this.SmartHome.user.user) && (password === this.SmartHome.user.password)) {
      return this.SmartHome.user;
    } else {
      return null;
    }
  }

  get_userOnly (username) {
    if (username === this.SmartHome.user.user) {
      return this.SmartHome.user;
    } else {
      return null;
    }
  }

  get_device (device_id, device) {
    if (device_id === "MMM-GoogleAssistant") {
      let data = device;
      data["id"] = device_id;
      return data;
    } else {
      return null;
    }
  }

  /** token rules **/
  check_token (headers) {
    let access_token = this.get_token(headers);
    if (!access_token) {
      console.error("[GA] [SMARTHOME] [TOKEN] No token found in headers");
      return null;
    }
    if (fs.existsSync(`${this.tokensDir}${access_token}`)) {
      let user = fs.readFileSync(`${this.tokensDir}${access_token}`, "utf8");
      return user;
    } else {
      console.error("[GA] [SMARTHOME] [TOKEN] Token not found in database", access_token);
      return null;
    }
  }

  get_token (headers) {
    if (!headers) return null;
    const auth = headers.authorization;
    let parts = auth.split(" ", 2);
    if (auth && parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      return parts[1];
    } else {
      return null;
    }
  }

  delete_token (access_token) {
    if (fs.existsSync(`${this.tokensDir}${access_token}`)) {
      fs.unlinkSync(`${this.tokensDir}${access_token}`);
    } else {
      console.error("[GA] [SMARTHOME] [TOKEN] Delete Failed", access_token);
    }
  }

  random_string (length = 8) {
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  serialize (obj) {
    let str = `?${Object.keys(obj).reduce(function (a, k) {
      a.push(`${k}=${encodeURIComponent(obj[k])}`);
      return a;
    }, []).join("&")}`;
    return str;
  }

  SHLanguage (language) {
    let lang = "en";

    switch (language) {
      case "da":
      case "nl":
      case "en":
      case "fr":
      case "de":
      case "hi":
      case "id":
      case "it":
      case "ja":
      case "ko":
      case "es":
      case "sv":
        lang = language;
        break;
      case "pt":
      case "pt-br":
        lang = "pt-BR";
        break;
      case "zh-tw":
        lang = "zh-TW";
        break;
      case "nb":
      case "nn":
        lang = "no";
        break;
      //case "th": ?? Thaï (th)
      default:
        lang = "en";
        break;
    }
    return lang;
  }

  /** homegraph **/
  async requestSync () {
    if (!this.SmartHome.homegraph) return;
    logGA("[HOMEGRAPH] [RequestSync] in Progress...");
    let body = {
      requestBody: {
        agentUserId: this.SmartHome.user.user,
        async: false
      }
    };
    try {
      const res = await this.SmartHome.homegraph.devices.requestSync(body);
      console.log("[GA] smarthome Ready!");
    } catch (e) {
      if (e.code) {
        console.error("[GA] [SMARTHOME] [HOMEGRAPH] [RequestSync] Error:", e.code, e.errors);
        this.send("Alert", `[requestSync] Error ${e.code} - ${e.errors[0].message} (${e.errors[0].reason})`);
      } else {
        console.error("[GA] [SMARTHOME] [HOMEGRAPH] [RequestSync]", e.toString());
        this.send("Alert", `[requestSync] ${e.toString()}`);
      }
    }
  }

  async queryGraph () {
    if (!this.SmartHome.homegraph) return;
    let query = {
      requestBody: {
        requestId: `GA-${Date.now()}`,
        agentUserId: this.SmartHome.user.user,
        inputs: [
          {
            payload: {
              devices: [
                {
                  id: "MMM-GoogleAssistant"
                }
              ]
            }
          }
        ]
      }
    };
    try {
      const res = await this.SmartHome.homegraph.devices.query(query);
      logGA("[HOMEGRAPH] [QueryGraph]", JSON.stringify(res.data));
    } catch (e) {
      console.log("[GA] [SMARTHOME] [HOMEGRAPH] [QueryGraph]", e.code ? e.code : e, e.errors ? e.errors : "");
    }
  }

  async updateGraph () {
    if (!this.SmartHome.homegraph) return;
    let EXT = this.SmartHome.EXT;
    let current = this.SmartHome.smarthome;
    let old = this.SmartHome.oldSmartHome;

    if (!_.isEqual(current, old)) {
      let state = {
        online: true
      };
      if (EXT["EXT-Screen"]) {
        state.on = current.Screen;
      }
      if (EXT["EXT-Volume"]) {
        state.currentVolume = current.Volume;
        state.isMuted = current.VolumeIsMuted;
      }
      if (EXT["EXT-FreeboxTV"] && current.TvIsPlaying) {
        state.currentInput = "EXT-FreeboxTV";
      } else if (EXT["EXT-SpotifyCanvasLyrics"] && current.Lyrics) {
        state.currentInput = "EXT-SpotifyCanvasLyrics";
      } else if (EXT["EXT-Pages"]) {
        state.currentInput = `page ${current.Page}`;
      }
      if (EXT["EXT-Spotify"]) {
        state.currentApplication = current.SpotifyIsConnected ? "spotify" : "home";
      }
      let body = {
        requestBody: {
          agentUserId: this.SmartHome.user.user,
          requestId: `GA-${Date.now()}`,
          payload: {
            devices: {
              states: {
                "MMM-GoogleAssistant": state
              }
            }
          }
        }
      };
      try {
        const res = await this.SmartHome.homegraph.devices.reportStateAndNotification(body);
        if (res.status !== 200) logGA("[HOMEGRAPH] [ReportState]", res.data, state, res.status, res.statusText);
      } catch (e) {
        console.error("[GA] [SMARTHOME] [HOMEGRAPH] [ReportState]", e.code ? e.code : e, e.errors ? e.errors : "");
      }
    }
  }

  /** callbacks **/

  send (name, values) {
    switch (name) {
      case "screen":
        logGA("[CALLBACK] Send screen:", values);
        this.sendSocketNotification("CB_SCREEN", values);
        break;
      case "volume":
        logGA("[CALLBACK] Send volume:", values);
        this.sendSocketNotification("CB_VOLUME", values);
        break;
      case "volumeMute":
        logGA("[CALLBACK] Send volume Mute:", values);
        this.sendSocketNotification("CB_VOLUME-MUTE", values);
        break;
      case "volumeUp":
        logGA("[CALLBACK] Send volume Up");
        this.sendSocketNotification("CB_VOLUME-UP");
        break;
      case "volumeDown":
        logGA("[CALLBACK] Send volume Down");
        this.sendSocketNotification("CB_VOLUME-DOWN");
        break;
      case "setPage":
        logGA("[CALLBACK] Send setInput:", values);
        this.sendSocketNotification("CB_SET-PAGE", values);
        break;
      case "setNextPage":
        logGA("[CALLBACK] Send setNextPage");
        this.sendSocketNotification("CB_SET-NEXT-PAGE");
        break;
      case "setPreviousPage":
        logGA("[CALLBACK] Send setPreviousPage");
        this.sendSocketNotification("CB_SET-PREVIOUS-PAGE");
        break;
      case "Alert":
        logGA("[CALLBACK] Send Alert:", values);
        this.sendSocketNotification("CB_ALERT", values);
        break;
      case "Done":
        logGA("[CALLBACK] Send Alert Done:", values);
        this.sendSocketNotification("CB_DONE", values);
        break;
      case "Reboot":
        logGA("[CALLBACK] Send Reboot");
        setTimeout(() => this.restart(), 8000);
        break;
      case "Locate":
        logGA("[CALLBACK] Send Locate");
        this.sendSocketNotification("CB_LOCATE");
        break;
      case "SpotifyPlay":
        logGA("[CALLBACK] Send SpotifyPlay");
        this.sendSocketNotification("CB_SPOTIFY-PLAY");
        break;
      case "SpotifyPause":
        logGA("[CALLBACK] Send SpotifyPause");
        this.sendSocketNotification("CB_SPOTIFY-PAUSE");
        break;
      case "SpotifyPrevious":
        logGA("[CALLBACK] Send SpotifyPrevious");
        this.sendSocketNotification("CB_SPOTIFY-PREVIOUS");
        break;
      case "SpotifyNext":
        logGA("[CALLBACK] Send SpotifyNext");
        this.sendSocketNotification("CB_SPOTIFY-NEXT");
        break;
      case "Stop":
        logGA("[CALLBACK] Send Stop");
        this.sendSocketNotification("CB_STOP");
        break;
      case "TVPlay":
        logGA("[CALLBACK] Send TVPlay");
        this.sendSocketNotification("CB_TV-PLAY");
        break;
      case "TVNext":
        logGA("[CALLBACK] Send TVNext");
        this.sendSocketNotification("CB_TV-NEXT");
        break;
      case "TVPrevious":
        logGA("[CALLBACK] Send TVPrevious");
        this.sendSocketNotification("CB_TV-PREVIOUS");
        break;
      case "SpotifyLyricsOn":
        logGA("[CALLBACK] Send Lyrics on");
        this.sendSocketNotification("CB_SPOTIFY-LYRICS-ON");
        break;
      case "SpotifyLyricsOff":
        logGA("[CALLBACK] Send Lyrics off");
        this.sendSocketNotification("CB_SPOTIFY-LYRICS-OFF");
        break;
      default:
        logGA("[CALLBACK] Unknow callback:", name);
        break;
    }
  }
}

module.exports = smarthome;
