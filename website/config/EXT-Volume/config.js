var defaultConfig = {
  module: 'EXT-Volume',
  disabled: false,
  config: {
    debug: false,
    startSpeakerVolume: 100,
    startRecorderVolume: 50,
    syncVolume: false
  }
}

var schema = {
  "title": "EXT-Volume",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-Volume"
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
        "startSpeakerVolume": {
          "type": "number",
          "title": "{EXT-Volume_Start}",
          "default": 100,
          "enum": [0,10,20,30,40,50,60,70,80,90,100],
          "minimum": 0,
          "maximum": 100
        },
        "startRecorderVolume": {
          "type": "number",
          "title": "{EXT-Volume_Start}",
          "default": 100,
          "enum": [0,10,20,30,40,50,60,70,80,90,100],
          "minimum": 0,
          "maximum": 100
        },
        "syncVolume": {
          "type": "boolean",
          "title": "{EXT-Volume_Sync}",
          "default": false
        },

      },
      "required": ["startSpeakerVolume"]
    }
  },
  "required": ["module", "config"]
}

exports.default = defaultConfig
exports.schema = schema
