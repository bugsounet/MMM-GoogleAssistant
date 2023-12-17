var defaultConfig = {
  module: "EXT-Bard",
  disabled: false,
  config: {
    debug: false,
    COOKIE_KEY: null,
    scrollStep: 25,
    scrollInterval: 1000,
    scrollStart: 10000
  }
}

var schema = {
  "title": "EXT-Bard",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-Browser"
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
        "COOKIE_KEY": {
          "type": "string",
          "title": "Google Bard COOKIE",
          "default": null
        },
        "scrollStep": {
          "type": "number",
          "title": "{EXT-Browser_Step}",
          "default": 25
        },
        "scrollInterval": {
          "type": "number",
          "title": "{EXT-Browser_Interval}",
          "default": 1000
        },
        "scrollStart": {
          "type": "number",
          "title": "{EXT-Browser_Start}",
          "default": 10000
        }
      },
      "required": ["COOKIE_KEY"],
    }
  },
  "required": ["module"]
}

exports.default = defaultConfig
exports.schema = schema
