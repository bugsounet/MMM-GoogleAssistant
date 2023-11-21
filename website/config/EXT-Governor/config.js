var defaultConfig = {
  module: 'EXT-Governor',
  disabled: false,
  config: {
    debug: false,
    sleeping: "powersave",
    working: "ondemand"
  }
}

var schema = {
  "title": "EXT-Governor",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-Governor"
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
        "sleeping": {
          "type": "string",
          "title": "{EXT-Governor_Sleep}",
          "default": "powersave",
          "enum": [ "ondemand", "powersave", "performance", "conservative" , "userspace"  ]
        },
        "working": {
          "type": "string",
          "title": "{EXT-Governor_Work}",
          "default": "ondemand",
          "enum": [ "ondemand", "powersave", "performance", "conservative" , "userspace"  ]
        },
      }
    }
  },
  "required": ["module"]
}

exports.default = defaultConfig
exports.schema = schema
