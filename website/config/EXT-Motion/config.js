var defaultConfig = {
  module: 'EXT-Motion',
  disabled: false,
  config: {
    debug: false,
    captureIntervalTime: 1000,
    scoreThreshold: 100,
    deviceId: null
  }
}

var schema = {
  "title": "EXT-Motion",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-Motion"
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
        "captureIntervalTime": {
          "type": "number",
          "title": "{EXT-Motion_captureIntervalTime}",
          "default": 1000,
          "enum": [500,1000,1500,2000],
          "minimum": 500,
          "maximum": 5000
        },
        "scoreThreshold": {
          "type": "number",
          "title": "{EXT-Motion_scoreThreshold}",
          "default": 100,
          "enum": [50,100,500,1000,2000,3000,4000],
          "minimum": 50,
          "maximum": 4000
        },
        "deviceId": {
          "type": ["string", "null"],
          "title": "{EXT-Motion_deviceId}",
          "default": null
        },
      }
    }
  },
  "required": ["module", "config"]
}

exports.default = defaultConfig
exports.schema = schema
