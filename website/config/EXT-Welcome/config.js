var defaultConfig = {
  module: "EXT-Welcome",
  disabled: false,
  config: {
    welcome: "brief Today"
  }
}

var schema = {
    "title": "EXT-Welcome",
    "description": "{PluginDescription}",
    "type": "object",
    "properties": {
      "module": {
        "type": "string",
        "title": "{PluginName}",
        "default": "EXT-Welcome"
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
          "welcome": {
            "type": "string",
            "title": "{EXT-Welcome_Welcome}",
            "default": "brief Today"
          }
        },
        "required": ["welcome"]
      }
    },
    "required": ["config","module"]
}

exports.default = defaultConfig
exports.schema = schema
