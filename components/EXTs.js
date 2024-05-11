/*********************/
/** EXTs Management **/
/*********************/

/* global logGA, configMerge */
/* eslint-disable no-useless-escape */

class EXTs {
  constructor (Tools) {
    this.translate = (...args) => Tools.translate(...args);
    this.sendNotification = (...args) => Tools.sendNotification(...args);
    this.sendSocketNotification = (...args) => Tools.sendSocketNotification(...args);
    this.notificationReceived = (...args) => Tools.notificationReceived(...args);
    this.socketNotificationReceived = (...args) => Tools.socketNotificationReceived(...args);

    this.ExtDB = [
      "EXT-Alert",
      "EXT-Background",
      "EXT-Bring",
      "EXT-Browser",
      "EXT-Detector",
      "EXT-FreeboxTV",
      "EXT-GooglePhotos",
      "EXT-Governor",
      "EXT-Internet",
      "EXT-Keyboard",
      "EXT-Librespot",
      "EXT-MusicPlayer",
      "EXT-Motion",
      "EXT-Pages",
      "EXT-Photos",
      "EXT-Pir",
      "EXT-RadioPlayer",
      "EXT-RemoteControler",
      "EXT-Screen",
      "EXT-Selfies",
      "EXT-SelfiesFlash",
      "EXT-SelfiesSender",
      "EXT-SelfiesViewer",
      "EXT-Spotify",
      "EXT-SpotifyCanvasLyrics",
      "EXT-StreamDeck",
      "EXT-TelegramBot",
      "EXT-Touch",
      "EXT-Updates",
      "EXT-VLCServer",
      "EXT-Volume",
      "EXT-Website",
      "EXT-Welcome",
      "EXT-YouTube",
      "EXT-YouTubeCast"
    ];

    this.EXT = {
      GA_Ready: false
    };
    console.log("[GA] EXTs Ready");
  }

  async init () {
    try {
      await this.checkModules();
      this.sendSocketNotification("NOMODULE-ERROR");
    } catch (err) {
      this.sendSocketNotification("MODULE-ERROR", err);
      return false;
    }
    this.createDB();
    return true;
  }

  async createDB () {
    await Promise.all(this.ExtDB.map((Ext) => {
      this.EXT[Ext] = {
        hello: false,
        connected: false
      };
    }));

    /** special rules **/
    this.EXT["EXT-Motion"].started = false;
    this.EXT["EXT-Pir"].started = false;
    this.EXT["EXT-Screen"].power = true;
    this.EXT["EXT-Updates"].update = {};
    this.EXT["EXT-Updates"].npm = {};
    this.EXT["EXT-Spotify"].remote = false;
    this.EXT["EXT-Spotify"].play = false;
    this.EXT["EXT-Volume"].speaker = 0;
    this.EXT["EXT-Volume"].isMuted = false;
    this.EXT["EXT-Volume"].recorder = 0;
    this.EXT["EXT-SpotifyCanvasLyrics"].forced = false;
    this.EXT["EXT-Pages"].actual = 0;
    this.EXT["EXT-Pages"].total = 0;
  }

  setGA_Ready () {
    this.EXT.GA_Ready = true;
  }

  Get_EXT_Status () {
    return this.EXT;
  }

  Get_DB() {
    return this.ExtDB;
  }

  /** Action on GA Status **/
  ActionsGA (status) {
    logGA("[EXTs] Received GA status:", status);
    if (!this.EXT.GA_Ready) return console.log("[GA] [EXTs] MMM-GoogleAssistant is not ready");
    switch (status) {
      case "LISTEN":
      case "THINK":
        if (this.EXT["EXT-Detector"].hello) this.sendNotification("EXT_DETECTOR-STOP");
        if (this.EXT["EXT-Touch"].hello) this.sendNotification("EXT_TOUCH-BLINK");
        if (this.EXT["EXT-Screen"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) {
          if (!this.EXT["EXT-Screen"].power) this.sendNotification("EXT_SCREEN-WAKEUP");
          this.sendNotification("EXT_SCREEN-LOCK", { show: true });
          if (this.EXT["EXT-Motion"].hello && this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-DESTROY");
          if (this.EXT["EXT-Pir"].hello && this.EXT["EXT-Pir"].started) this.sendNotification("EXT_PIR-STOP");
          if (this.EXT["EXT-StreamDeck"].hello) this.sendNotification("EXT_STREAMDECK-ON");
        }
        if (this.EXT["EXT-Pages"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) this.sendNotification("EXT_PAGES-PAUSE");
        if (this.EXT["EXT-Spotify"].hello && this.EXT["EXT-Spotify"].connected) this.sendNotification("EXT_SPOTIFY-VOLUME_MIN");
        if (this.EXT["EXT-RadioPlayer"].hello && this.EXT["EXT-RadioPlayer"].connected) this.sendNotification("EXT_RADIO-VOLUME_MIN");
        if (this.EXT["EXT-MusicPlayer"].hello && this.EXT["EXT-MusicPlayer"].connected) this.sendNotification("EXT_MUSIC-VOLUME_MIN");
        if (this.EXT["EXT-FreeboxTV"].hello && this.EXT["EXT-FreeboxTV"].connected) this.sendNotification("EXT_FREEBOXTV-VOLUME_MIN");
        if (this.EXT["EXT-YouTube"].hello && this.EXT["EXT-YouTube"].connected) this.sendNotification("EXT_YOUTUBE-VOLUME_MIN");
        break;
      case "STANDBY":
        if (this.EXT["EXT-Detector"].hello) this.sendNotification("EXT_DETECTOR-START");
        if (this.EXT["EXT-Touch"].hello) this.sendNotification("EXT_TOUCH-START");
        if (this.EXT["EXT-Screen"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) {
          this.sendNotification("EXT_SCREEN-UNLOCK", { show: true });
          if (this.EXT["EXT-Motion"].hello && !this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-INIT");
          if (this.EXT["EXT-Pir"].hello && !this.EXT["EXT-Pir"].started) this.sendNotification("EXT_PIR-START");
          if (this.EXT["EXT-StreamDeck"].hello) this.sendNotification("EXT_STREAMDECK-OFF");
        }
        if (this.EXT["EXT-Pages"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) this.sendNotification("EXT_PAGES-RESUME");
        if (this.EXT["EXT-Spotify"].hello && this.EXT["EXT-Spotify"].connected) this.sendNotification("EXT_SPOTIFY-VOLUME_MAX");
        if (this.EXT["EXT-RadioPlayer"].hello && this.EXT["EXT-RadioPlayer"].connected) this.sendNotification("EXT_RADIO-VOLUME_MAX");
        if (this.EXT["EXT-MusicPlayer"].hello && this.EXT["EXT-MusicPlayer"].connected) this.sendNotification("EXT_MUSIC-VOLUME_MAX");
        if (this.EXT["EXT-FreeboxTV"].hello && this.EXT["EXT-FreeboxTV"].connected) this.sendNotification("EXT_FREEBOXTV-VOLUME_MAX");
        if (this.EXT["EXT-YouTube"].hello && this.EXT["EXT-YouTube"].connected) this.sendNotification("EXT_YOUTUBE-VOLUME_MAX");
        break;
      case "REPLY":
      case "CONTINUE":
      case "CONFIRMATION":
      case "ERROR":
      case "HOOK":
        break;
    }
  }

  /** Activate automaticaly any plugins **/
  helloEXT (module) {
    switch (module) {
      case this.ExtDB.find((name) => name === module): //read DB and find module
        this.EXT[module].hello = true;
        this.sendNotification("EXT_DB-UPDATE", module);
        logGA("[EXTs] Hello,", module);
        this.onStartPlugin(module);
        break;
      default:
        logGA(`[EXTs] Hi, who are you ${module}?`);
        this.sendNotification("EXT_ALERT", {
          message: `Unknow EXT: Who is ${module} !?`,
          type: "warning",
          timer: 10000
        });
        break;
    }
  }

  /** Rule when a plugin send Hello **/
  onStartPlugin (plugin) {
    if (!plugin) return;
    if (plugin === "EXT-Background") this.notificationReceived("GA_FORCE_FULLSCREEN");
    if (plugin === "EXT-Detector") setTimeout(() => this.sendNotification("EXT_DETECTOR-START"), 300);
    if (plugin === "EXT-Touch") this.sendNotification("EXT_TOUCH-START");
    if (plugin === "EXT-Pages") this.sendNotification("EXT_PAGES-Gateway");
    if (plugin === "EXT-Pir") this.sendNotification("EXT_PIR-START");
    if (plugin === "EXT-Bring") this.sendNotification("EXT_BRING-START");
  }

  /** Connect rules **/
  connectEXT (extName) {
    if (!this.EXT.GA_Ready) return console.error(`[GA] [EXTs] Hey ${extName}!, MMM-GoogleAssistant is not ready`);
    if (!this.EXT[extName] || this.EXT[extName].connected) return;

    if (this.EXT["EXT-Screen"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) {
      if (!this.EXT["EXT-Screen"].power) this.sendNotification("EXT_SCREEN-WAKEUP");
      this.sendNotification("EXT_SCREEN-LOCK");
      if (this.EXT["EXT-Motion"].hello && this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-DESTROY");
      if (this.EXT["EXT-Pir"].hello && this.EXT["EXT-Pir"].started) this.sendNotification("EXT_PIR-STOP");
      if (this.EXT["EXT-StreamDeck"].hello) this.sendNotification("EXT_STREAMDECK-ON");
      if (this.EXT["EXT-Bring"].hello) this.sendNotification("EXT_BRING-STOP");
    }

    if (this.browserOrPhotoIsConnected()) {
      logGA("[EXTs] Connected:", extName, "[browserOrPhoto Mode]");
      this.EXT[extName].connected = true;
      this.lockPagesByGW(extName);
      this.sendNotification("EXT_STATUS", this.EXT);
      return;
    }

    if (this.EXT["EXT-Spotify"].hello && this.EXT["EXT-Spotify"].connected) this.sendNotification("EXT_SPOTIFY-STOP");
    if (this.EXT["EXT-MusicPlayer"].hello && this.EXT["EXT-MusicPlayer"].connected) this.sendNotification("EXT_MUSIC-STOP");
    if (this.EXT["EXT-RadioPlayer"].hello && this.EXT["EXT-RadioPlayer"].connected) this.sendNotification("EXT_RADIO-STOP");
    if (this.EXT["EXT-YouTube"].hello && this.EXT["EXT-YouTube"].connected) this.sendNotification("EXT_YOUTUBE-STOP");
    if (this.EXT["EXT-YouTubeCast"].hello && this.EXT["EXT-YouTubeCast"].connected) this.sendNotification("EXT_YOUTUBECAST-STOP");
    if (this.EXT["EXT-FreeboxTV"].hello && this.EXT["EXT-FreeboxTV"].connected) this.sendNotification("EXT_FREEBOXTV-STOP");

    logGA("[EXTs] Connected:", extName);
    logGA("[EXTs] Debug:", this.EXT);
    this.EXT[extName].connected = true;
    this.lockPagesByGW(extName);
  }

  /** disconnected rules **/
  disconnectEXT (extName) {
    if (!this.EXT.GA_Ready) return console.error("[GA] [EXTs] MMM-GoogleAssistant is not ready");
    if (!this.EXT[extName] || !this.EXT[extName].connected) return;
    this.EXT[extName].connected = false;

    // sport time ... verify if there is again an EXT module connected !
    setTimeout(() => { // wait 1 sec before scan ...
      if (this.EXT["EXT-Screen"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) {
        this.sendNotification("EXT_SCREEN-UNLOCK");
        if (this.EXT["EXT-Motion"].hello && !this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-INIT");
        if (this.EXT["EXT-Pir"].hello && !this.EXT["EXT-Pir"].started) this.sendNotification("EXT_PIR-START");
        if (this.EXT["EXT-StreamDeck"].hello) this.sendNotification("EXT_STREAMDECK-OFF");
        if (this.EXT["EXT-Bring"].hello) this.sendNotification("EXT_BRING-START");
      }
      if (this.EXT["EXT-Pages"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) this.sendNotification("EXT_PAGES-UNLOCK");
      logGA("[EXTs] Disconnected:", extName);
    }, 1000);
  }

  /** need to lock EXT-Pages ? **/
  lockPagesByGW (extName) {
    if (this.EXT["EXT-Pages"].hello) {
      if (this.EXT[extName].hello && this.EXT[extName].connected && typeof this.EXT["EXT-Pages"][extName] === "number") {
        this.sendNotification("EXT_PAGES-CHANGED", this.EXT["EXT-Pages"][extName]);
        this.sendNotification("EXT_PAGES-LOCK");
      }
      else this.sendNotification("EXT_PAGES-PAUSE");
    }
  }

  /** need to force lock/unlock Pages and Screen ? **/
  forceLockPagesAndScreen () {
    if (this.EXT["EXT-Pages"].hello) this.sendNotification("EXT_PAGES-LOCK");
    if (this.EXT["EXT-Screen"].hello) {
      if (!this.EXT["EXT-Screen"].power) this.sendNotification("EXT_SCREEN-WAKEUP");
      this.sendNotification("EXT_SCREEN-LOCK");
    }
  }

  forceUnLockPagesAndScreen () {
    if (this.EXT["EXT-Pages"].hello) this.sendNotification("EXT_PAGES-UNLOCK");
    if (this.EXT["EXT-Screen"].hello) this.sendNotification("EXT_SCREEN-UNLOCK");
  }

  browserOrPhotoIsConnected () {
    if ((this.EXT["EXT-Browser"].hello && this.EXT["EXT-Browser"].connected)
      || (this.EXT["EXT-Photos"].hello && this.EXT["EXT-Photos"].connected)) {
      logGA("[EXTs] browserOrPhoto", true);
      return true;
    }
    return false;
  }

  /** hasPluginConnected(obj, key, value)
   * obj: object to check
   * key: key to check in deep
   * value: value to check with associated key
   * @bugsounet 09/01/2022
  **/
  hasPluginConnected (obj, key, value) {
    if (typeof obj === "object" && obj !== null) {
      if (obj.hasOwnProperty(key)) return true;
      for (var p in obj) {
        if (obj.hasOwnProperty(p) && this.hasPluginConnected(obj[p], key, value)) {
          //logGA("check", key+":"+value, "in", p)
          if (obj[p][key] === value) {
            //logGA(p, "is connected")
            return true;
          }
        }
      }
    }
    return false;
  }

  /** checkModules **/
  checkModules () {
    var TB = 0;
    var PIR = 0;
    var RC = 0;
    let error = null;
    return new Promise((resolve, reject) => {
      MM.getModules().withClass("EXT-Telegrambot MMM-TelegramBot").enumerate((module) => {
        TB++;
        if (TB >= 2) {
          error = "You can't start MMM-GoogleAssistant with MMM-TelegramBot and EXT-TelegramBot!";
          this.socketNotificationReceived("NOT_INITIALIZED", { message: error });
          return reject(error);
        }
      });
      MM.getModules().withClass("MMM-Pir").enumerate((module) => {
        PIR++;
        if (PIR >= 1) {
          error = "You can't start MMM-GoogleAssistant with MMM-Pir. Please use EXT-Screen and EXT-Pir";
          this.socketNotificationReceived("NOT_INITIALIZED", { message: "You can't start MMM-GoogleAssistant with MMM-Pir. Please use EXT-Screen and EXT-Pir" });
          return reject(error);
        }
      });
      MM.getModules().withClass("MMM-Remote-Control").enumerate((module) => {
        RC++;
        if (RC >= 1) {
          error = "You can't start MMM-GoogleAssistant with MMM-Remote-Control";
          this.socketNotificationReceived("NOT_INITIALIZED", { message: error });
          return reject(error);
        }
      });
      resolve(true);
    });
  }

  /** Notification Actions **/
  ActionsEXTs (noti, payload, sender) {
    if (!this.EXT.GA_Ready) return console.log("[GA] [EXTs] MMM-GoogleAssistant is not ready");
    switch (noti) {
      case "EXT_HELLO":
        this.helloEXT(payload);
        break;
      case "EXT_PAGES-Gateway":
        if (sender.name === "EXT-Pages") Object.assign(this.EXT["EXT-Pages"], payload);
        break;
      case "EXT_GATEWAY":
        this.gatewayEXT(payload);
        break;
      case "EXT_GATEWAY-Restart":
        this.sendSocketNotification("RESTART");
        break;
      case "EXT_GATEWAY-Close":
        this.sendSocketNotification("CLOSE");
        break;
      case "EXT_SCREEN-POWER":
        if (!this.EXT["EXT-Screen"].hello) return console.log("[GA] [EXTs] Warn Screen don't say to me HELLO!");
        this.EXT["EXT-Screen"].power = payload;
        if (this.EXT["EXT-Pages"].hello) {
          if (this.EXT["EXT-Screen"].power) {
            this.sendNotification("EXT_PAGES-RESUME");
            this.sendNotification("EXT_PAGES-HOME");
          }
          else this.sendNotification("EXT_PAGES-PAUSE");
        }
        break;
      case "EXT_STOP":
        if (this.EXT["EXT-Alert"].hello && this.hasPluginConnected(this.EXT, "connected", true)) {
          this.sendNotification("EXT_ALERT", {
            type: "information",
            message: this.translate("EXTStop")
          });
        }
        break;
      case "EXT_MUSIC-CONNECTED":
        if (!this.EXT["EXT-MusicPlayer"].hello) return console.log("[GA] [EXTs] Warn MusicPlayer don't say to me HELLO!");
        this.connectEXT("EXT-MusicPlayer");
        break;
      case "EXT_MUSIC-DISCONNECTED":
        if (!this.EXT["EXT-MusicPlayer"].hello) return console.log("[GA] [EXTs] Warn MusicPlayer don't say to me HELLO!");
        this.disconnectEXT("EXT-MusicPlayer");
        break;
      case "EXT_RADIO-CONNECTED":
        if (!this.EXT["EXT-RadioPlayer"].hello) return console.log("[GA] [EXTs] Warn RadioPlayer don't say to me HELLO!");
        this.connectEXT("EXT-RadioPlayer");
        break;
      case "EXT_RADIO-DISCONNECTED":
        if (!this.EXT["EXT-RadioPlayer"].hello) return console.log("[GA] [EXTs] Warn RadioPlayer don't say to me HELLO!");
        this.disconnectEXT("EXT-RadioPlayer");
        break;
      case "EXT_SPOTIFY-CONNECTED":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!");
        this.EXT["EXT-Spotify"].remote = true;
        if (this.EXT["EXT-SpotifyCanvasLyrics"].hello && this.EXT["EXT-SpotifyCanvasLyrics"].forced) this.connectEXT("EXT-SpotifyCanvasLyrics");
        break;
      case "EXT_SPOTIFY-DISCONNECTED":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!");
        this.EXT["EXT-Spotify"].remote = false;
        if (this.EXT["EXT-SpotifyCanvasLyrics"].hello && this.EXT["EXT-SpotifyCanvasLyrics"].forced) this.disconnectEXT("EXT-SpotifyCanvasLyrics");
        break;
      case "EXT_SPOTIFY-PLAYING":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!");
        this.EXT["EXT-Spotify"].play = payload;
        break;
      case "EXT_SPOTIFY-PLAYER_CONNECTED":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!");
        this.connectEXT("EXT-Spotify");
        break;
      case "EXT_SPOTIFY-PLAYER_DISCONNECTED":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs Warn Spotify don't say to me HELLO!");
        this.disconnectEXT("EXT-Spotify");
        break;
      case "EXT_YOUTUBE-CONNECTED":
        if (!this.EXT["EXT-YouTube"].hello) return console.error("[GA] [EXTs] Warn YouTube don't say to me HELLO!");
        this.connectEXT("EXT-YouTube");
        break;
      case "EXT_YOUTUBE-DISCONNECTED":
        if (!this.EXT["EXT-YouTube"].hello) return console.error("[GA] [EXTs] Warn YouTube don't say to me HELLO!");
        this.disconnectEXT("EXT-YouTube");
        break;
      case "EXT_YOUTUBECAST-CONNECTED":
        if (!this.EXT["EXT-YouTubeCast"].hello) return console.error("[GA] [EXTs] Warn YouTubeCast don't say to me HELLO!");
        this.connectEXT("EXT-YouTubeCast");
        break;
      case "EXT_YOUTUBECAST-DISCONNECTED":
        if (!this.EXT["EXT-YouTubeCast"].hello) return console.error("[GA] [EXTs] Warn YouTubeCast don't say to me HELLO!");
        this.disconnectEXT("EXT-YouTubeCast");
        break;
      case "EXT_BROWSER-CONNECTED":
        if (!this.EXT["EXT-Browser"].hello) return console.error("[GA] [EXTs] Warn Browser don't say to me HELLO!");
        this.connectEXT("EXT-Browser");
        break;
      case "EXT_BROWSER-DISCONNECTED":
        if (!this.EXT["EXT-Browser"].hello) return console.error("[GA] [EXTs] Warn Browser don't say to me HELLO!");
        this.disconnectEXT("EXT-Browser");
        break;
      case "EXT_FREEBOXTV-CONNECTED":
        if (!this.EXT["EXT-FreeboxTV"].hello) return console.error("[GA] [EXTs] Warn FreeboxTV don't say to me HELLO!");
        this.connectEXT("EXT-FreeboxTV");
        break;
      case "EXT_FREEBOXTV-DISCONNECTED":
        if (!this.EXT["EXT-FreeboxTV"].hello) return console.error("[GA] [EXTs] Warn FreeboxTV don't say to me HELLO!");
        this.disconnectEXT("EXT-FreeboxTV");
        break;
      case "EXT_PHOTOS-CONNECTED":
        if (!this.EXT["EXT-Photos"].hello) return console.error("[GA] [EXTs] Warn Photos don't say to me HELLO!");
        this.connectEXT("EXT-Photos");
        break;
      case "EXT_PHOTOS-DISCONNECTED":
        if (!this.EXT["EXT-Photos"].hello) return console.error("[GA] [EXTs] Warn Photos don't say to me HELLO!");
        this.disconnectEXT("EXT-Photos");
        break;
      case "EXT_INTERNET-DOWN":
        if (!this.EXT["EXT-Internet"].hello) return console.error("[GA] [EXTs] Warn Internet don't say to me HELLO!");
        if (this.EXT["EXT-Detector"].hello) this.sendNotification("EXT_DETECTOR-STOP");
        if (this.EXT["EXT-Touch"].hello) this.sendNotification("EXT_TOUCH-STOP");
        if (this.EXT["EXT-Spotify"].hello) this.sendNotification("EXT_SPOTIFY-MAIN_STOP");
        if (this.EXT["EXT-GooglePhotos"].hello) this.sendNotification("EXT_GOOGLEPHOTOS-STOP");
        break;
      case "EXT_INTERNET-UP":
        if (!this.EXT["EXT-Internet"].hello) return console.error("[GA] [EXTs] Warn Internet don't say to me HELLO!");
        if (this.EXT["EXT-Detector"].hello) this.sendNotification("EXT_DETECTOR-START");
        if (this.EXT["EXT-Touch"].hello) this.sendNotification("EXT_TOUCH-START");
        if (this.EXT["EXT-Spotify"].hello) this.sendNotification("EXT_SPOTIFY-MAIN_START");
        if (this.EXT["EXT-GooglePhotos"].hello) this.sendNotification("EXT_GOOGLEPHOTOS-START");
        break;
      case "EXT_UPDATES-MODULE_UPDATE":
        if (!this.EXT || !this.EXT["EXT-Updates"].hello) return console.error("[GA] [EXTs] Warn UN don't say to me HELLO!");
        this.EXT["EXT-Updates"].module = payload;
        break;
      case "EXT_VOLUME_GET":
        if (!this.EXT["EXT-Volume"].hello) return console.error("[GA] [EXTs] Warn Volume don't say to me HELLO!");
        this.EXT["EXT-Volume"].speaker = payload.Speaker;
        this.EXT["EXT-Volume"].isMuted = payload.SpeakerIsMuted;
        this.EXT["EXT-Volume"].recorder = payload.Recorder;
        break;
      case "EXT_SPOTIFY-SCL_FORCED":
        if (!this.EXT["EXT-SpotifyCanvasLyrics"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!");
        this.EXT["EXT-SpotifyCanvasLyrics"].forced = payload;
        if (this.EXT["EXT-SpotifyCanvasLyrics"].forced && this.EXT["EXT-Spotify"].remote && this.EXT["EXT-Spotify"].play) this.connectEXT("EXT-SpotifyCanvasLyrics");
        if (!this.EXT["EXT-SpotifyCanvasLyrics"].forced && this.EXT["EXT-SpotifyCanvasLyrics"].connected) this.disconnectEXT("EXT-SpotifyCanvasLyrics");
        break;
      case "EXT_MOTION-STARTED":
        if (!this.EXT["EXT-Motion"].hello) return console.error("[GA] [EXTs] Warn Motion don't say to me HELLO!");
        this.EXT["EXT-Motion"].started = true;
        break;
      case "EXT_MOTION-STOPPED":
        if (!this.EXT["EXT-Motion"].hello) return console.error("[GA] [EXTs] Warn Motion don't say to me HELLO!");
        this.EXT["EXT-Motion"].started = false;
        break;
      case "EXT_PIR-STARTED":
        if (!this.EXT["EXT-Pir"].hello) return console.error("[GA] [EXTs] Warn Pir don't say to me HELLO!");
        this.EXT["EXT-Pir"].started = true;
        break;
      case "EXT_PIR-STOPPED":
        if (!this.EXT["EXT-Pir"].hello) return console.error("[GA] [EXTs] Warn Pir don't say to me HELLO!");
        this.EXT["EXT-Pir"].started = false;
        break;
      case "EXT_SELFIES-START":
        if (!this.EXT["EXT-Selfies"].hello) return console.error("[GA] [EXTs] Warn Selfies don't say to me HELLO!");
        this.connectEXT("EXT-Selfies");
        if (this.EXT["EXT-Motion"].hello && this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-DESTROY");
        break;
      case "EXT_SELFIES-END":
        if (!this.EXT["EXT-Selfies"].hello) return console.error("[GA] [EXTs Warn Selfies don't say to me HELLO!");
        this.disconnectEXT("EXT-Selfies");
        if (this.EXT["EXT-Motion"].hello && !this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-INIT");
        break;
      case "EXT_PAGES-NUMBER_IS":
        if (!this.EXT["EXT-Pages"].hello) return console.error("[GA] [EXTs] Warn Pages don't say to me HELLO!");
        this.EXT["EXT-Pages"].actual = payload.Actual;
        this.EXT["EXT-Pages"].total = payload.Total;
        break;

      /** Warn if not in db **/
      default:
        logGA("[EXTs] Sorry, i don't understand what is", noti, payload || "");
        break;
    }
    this.sendNotification("EXT_STATUS", this.EXT);
    logGA("[EXTs] Status:", this.EXT);
  }

  /**********************/
  /** Scan GA Response **/
  /**********************/
  gatewayEXT (response) {
    if (!response) return; // @todo scan if type array ??
    logGA("[EXTs] Response Scan");
    let tmp = {
      photos: {
        urls: response.photos && response.photos.length ? response.photos : [],
        length: response.photos && response.photos.length ? response.photos.length : 0
      },
      links: {
        urls: response.urls && response.urls.length ? response.urls : [],
        length: response.urls && response.urls.length ? response.urls.length : 0
      },
      youtube: response.youtube
    };

    // the show must go on !
    var urls = configMerge({}, urls, tmp);
    if (urls.photos.length > 0 && this.EXT["EXT-Photos"].hello) {
      this.EXT["EXT-Photos"].connected = true;
      this.sendNotification("EXT_PHOTOS-OPEN", urls.photos.urls);
      logGA("[EXTs] Forced connected: EXT-Photos");
    }
    else if (urls.links.length > 0) {
      this.urlsScan(urls);
    } else if (urls.youtube && this.EXT["EXT-YouTube"].hello) {
      this.sendNotification("EXT_YOUTUBE-SEARCH", urls.youtube);
      logGA("[EXTs] Sended to YT", urls.youtube);
    }
    logGA("[EXTs] Response Structure:", urls);
  }

  /** urls scan : dispatch url, youtube, spotify **/
  /** use the FIRST discover link only **/
  urlsScan (urls) {
    var firstURL = urls.links.urls[0];

    /** YouTube RegExp **/
    var YouTubeLink = new RegExp("youtube\.com\/([a-z]+)\\?([a-z]+)\=([0-9a-zA-Z\-\_]+)", "ig");

    /** Scan Youtube Link **/
    var YouTube = YouTubeLink.exec(firstURL);

    if (YouTube) {
      let Type;
      if (YouTube[1] === "watch") Type = "id";
      if (YouTube[1] === "playlist") Type = "playlist";
      if (!Type) return console.log("[EXTs] [GA:EXT:YouTube] Unknow Type !", YouTube);
      if (this.EXT["EXT-YouTube"].hello) {
        if (Type === "playlist") {
          this.sendNotification("EXT_ALERT", {
            message: "EXT_YOUTUBE don't support playlist",
            timer: 5000,
            type: "warning"
          });
          return;
        }
        this.sendNotification("EXT_YOUTUBE-PLAY", YouTube[3]);
      }
      return;
    }

    /** scan spotify links **/
    /** Spotify RegExp **/
    var SpotifyLink = new RegExp("open\.spotify\.com\/([a-z]+)\/([0-9a-zA-Z\-\_]+)", "ig");
    var Spotify = SpotifyLink.exec(firstURL);
    if (Spotify) {
      let type = Spotify[1];
      let id = Spotify[2];
      if (this.EXT["EXT-Spotify"].hello) {
        if (type === "track") {
          // don't know why tracks works only with uris !?
          this.sendNotification("EXT_SPOTIFY-PLAY", { uris: [`spotify:track:${id}`] });
        }
        else {
          this.sendNotification("EXT_SPOTIFY-PLAY", { context_uri: `spotify:${type}:${id}` });
        }
      }
      return;
    }
    // send to Browser
    if (this.EXT["EXT-Browser"].hello) {
      // force connexion for rules (don't turn off other EXT)
      this.EXT["EXT-Browser"].connected = true;
      this.sendNotification("EXT_BROWSER-OPEN", firstURL);
      logGA("[EXTs] Forced connected: EXT-Browser");
    }
  }
}
