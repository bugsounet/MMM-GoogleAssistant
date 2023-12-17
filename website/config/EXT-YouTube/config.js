var defaultConfig = {
  module: "EXT-YouTube",
  position: "top_center",
  disabled: false,
  config: {
    fullscreen: false,
    width: "30vw",
    height: "30vh",
    useSearch: true,
    alwaysDisplayed: true,
    displayHeader: true,
    username: null,
    password: null
  }
}

var schema = {
  "title": "EXT-YouTube",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-YouTube"
    },
    "position": {
      "type": "string",
      "title": "{PluginPosition}",
      "default": "top_center",
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
    "disabled": {
      "type": "boolean",
      "title": "{PluginDisable}",
      "default": false
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
        "fullscreen": {
          "type": "boolean",
          "title": "{EXT-YouTube_Fullscreen}",
          "default": false
        },
        "width": {
          "type": "string",
          "title": "{EXT-YouTube_Width}",
          "default": "30vw"
        },
        "height": {
          "type": "string",
          "title": "{EXT-YouTube_Height}",
          "default": "30vh"
        },
        "useSearch": {
          "type": "boolean",
          "title": "{EXT-YouTube_Search}",
          "default": true
        },
        "alwaysDisplayed": {
          "type": "boolean",
          "title": "{EXT-YouTube_Display}",
          "default": true
        },
        "displayHeader": {
          "type": "boolean",
          "title": "{EXT-YouTube_Header}",
          "default": true
        },
        "username": {
          "type": [ "string", "null" ],
          "title": "{EXT-YouTube_Username}",
          "default": null
        },
        "password": {
          "type": [ "string", "null" ],
          "title": "{EXT-YouTube_Password}",
          "default": null
        }
      },
      "required": ["username", "password"]
    }
  },
  "required": ["module", "config", "position"]
}

exports.default = defaultConfig
exports.schema = schema
