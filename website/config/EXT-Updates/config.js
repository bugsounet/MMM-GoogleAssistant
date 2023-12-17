var defaultConfig = {
  module: "EXT-Updates",
  disabled: false,
  config: {
    debug: false,
    autoUpdate: true,
    autoRestart: true,
    logToConsole: true,
    timeout: 2*60*1000
  }
}

var schema = {
  "title": "EXT-Updates",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-Updates"
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
        "autoUpdate" : {
          "type": "boolean",
          "title": "{EXT-Updates_AutoUpdate}",
          "default": true
        },
        "autoRestart": {
          "type": "boolean",
          "title": "{EXT-Updates_AutoRestart}",
          "default": true
        },
        "logToConsole": {
          "type": "boolean",
          "title": "{EXT-Updates_Log}",
          "default": true
        },
        "timeout": {
          "type": "number",
          "title": "{EXT-Updates_Timeout}",
          "default": 120000
        }
      }
    }
  },
  "required": ["module", "config"]
}

exports.default = defaultConfig
exports.schema = schema
