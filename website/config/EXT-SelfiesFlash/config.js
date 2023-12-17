var defaultConfig = {
  module: 'EXT-SelfiesFlash',
  disabled: false,
  config: {
    debug: false,
    gpio: 17
  }
}

var schema = {
  "title": "EXT-SelfiesFlash",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-SelfiesFlash"
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
        "gpio": {
          "type": "number",
          "title": "{EXT-SelfiesFlash_gpio}",
          "default": 17,
          "enum": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
          "minimum": 0,
          "maximum": 26
        },
      },
      "required": ["gpio"]
    }
  },
  "required": ["module", "config"]
}

exports.default = defaultConfig
exports.schema = schema
