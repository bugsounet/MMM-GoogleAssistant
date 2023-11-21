var defaultConfig = {
  module: "EXT-Photos",
  disabled: false,
  config: {
    debug: false,
    displayDelay: 20 * 1000,
    loop: false
  }
}

var schema = {
  "title": "EXT-Photos",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-Photos"
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
        "displayDelay": {
          "type": "number",
          "title": "{EXT-Photos_Delay}",
          "default": 20000,
          "minimum": 0,
          "maximum": 60000
        },
        "loop": {
          "type": "boolean",
          "title": "{EXT-Photos_Loop}",
          "default": false
        }
      }
    }
  },
  "required": ["module"]
}

exports.default = defaultConfig
exports.schema = schema
