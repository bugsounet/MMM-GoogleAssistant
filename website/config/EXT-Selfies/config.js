var defaultConfig = {
  module: 'EXT-Selfies',
  disabled: false,
  position: "top_center",
  config: {
    debug: false,
    captureWidth:1280,
    captureHeight:720, // In some webcams, resolution ratio might be fixed so these values might not be applied.
    device: null, // For default camera. Or, device: "USB Camera" <-- See the backend log to get your installed camera name.
    // device is only used if preview not used
    usePreview: true,
    previewWidth:640,
    previewHeight:360,
    displayButton: true,
    buttonStyle: 1, // Set 1, 2, 3, 4 --- can be an array [1,2] for blinking --- 0 for default font-awesome icon (camera)
    buttons: {
      1: "master.png",
      2: "halloween.png",
      3: "birthday.png",
      4: "christmas.png"
    },
    blinkButton: false,
    playShutter: true,
    resultDuration: 10000,
    autoValidate: false,
    counterStyle: 0, // 0: default, 1: google, 2: point, 3: move, other will fallback to default (0)
    showResult: true
  }
}

var schema = {
  "title": "EXT-Selfies",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-Selfies"
    },
    "disabled": {
      "type": "boolean",
      "title": "{PluginDisable}",
      "default": false
    },
    "position": {
      "type": "string",
      "title": "{PluginPosition}",
      "default": "top_right",
      "enum": [
        "top_bar",
        "top_left",
        "top_center",
        "top_right",
        "upper_third",
        "middle_center",
        "lower_third",
        "bottom_left",
        "bottom_center",
        "bottom_right",
        "bottom_bar",
        "fullscreen_above",
        "fullscreen_below"
      ]
    },
    "config": {
      "type": "object",
      "title": "{PluginConfiguration}",
      "properties": {
        "debug": {
          "type": "boolean",
          "title": "{PluginDebug}",
          "default": false
        },
        "captureWidth": {
          "type": "number",
          "title": "{EXT-Selfies_captureWidth}",
          "default": 1280,
          "minimum": 1
        },
        "captureHeight": {
          "type": "number",
          "title": "{EXT-Selfies_captureHeight}",
          "default": 720,
          "minimum": 1
        },
        "device": {
          "type": ["string", "null"],
          "title": "{EXT-Selfies_device}",
          "default": null
        },
        "usePreview": {
          "type": "boolean",
          "title": "{EXT-Selfies_usePreview}",
          "default": true
        },
        "previewWidth": {
          "type": "number",
          "title": "{EXT-Selfies_previewWidth}",
          "default": 640,
          "minimum": 1
        },
        "previewHeight": {
          "type": "number",
          "title": "{EXT-Selfies_previewHeight}",
          "default": 360,
          "minimum": 1
        },
        "displayButton": {
          "type": "boolean",
          "title": "{EXT-Selfies_displayButton}",
          "default": true
        },
        "buttonStyle": {
          "type": ["array","number"],
          "title": "{EXT-Selfies_buttonStyle}",
          "default": 1
        },
        "buttons": {
          "type": "object",
          "title": "{EXT-Selfies_buttons}",
          "default": {
            1: "master.png",
            2: "halloween.png",
            3: "birthday.png",
            4: "christmas.png"
          }
        },
        "blinkButton": {
          "type": "boolean",
          "title": "{EXT-Selfies_blinkButton}",
          "default": false
        },
        "playShutter": {
          "type": "boolean",
          "title": "{EXT-Selfies_playShutter}",
          "default": true
        },
        "resultDuration": {
          "type": "number",
          "title": "{EXT-Selfies_resultDuration}",
          "default": 10000,
          "enum": [2000,3000,4000,5000,6000,7000,8000,9000,10000,11000,12000,13000,14000,15000],
          "minimum": 2000
        },
        "autoValidate": {
          "type": "boolean",
          "title": "{EXT-Selfies_autoValidate}",
          "default": true
        },
        "counterStyle": {
          "type": "number",
          "title": "{EXT-Selfies_counterStyle}",
          "default": 0,
          "enum": [0,1,2,3],
          "minimum": 0,
          "maximum": 3
        },
        "showResult": {
          "type": "boolean",
          "title": "{EXT-Selfies_showResult}",
          "default": true
        }
      }
    }
  }
}

exports.default = defaultConfig
exports.schema = schema
