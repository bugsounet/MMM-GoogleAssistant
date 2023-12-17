var defaultConfig = {
  module: 'EXT-SelfiesViewer',
  disabled: false,
  position: "top_center",
  config: {
    debug: false,
    moduleWidth: 300,
    moduleHeight: 250,
    displayDelay: 10000,
    displayBackground: true,
    sortBy: "new"
  }
}

var schema = {
  "title": "EXT-SelfiesViewer",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-SelfiesViewer"
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
        "moduleWidth": {
          "type": "number",
          "title": "{EXT-SelfiesViewer_moduleWidth}",
          "default": 300
        },
        "moduleHeight": {
          "type": "number",
          "title": "{EXT-SelfiesViewer_moduleHeight}",
          "default": 250
        },
        "displayDelay": {
          "type": "number",
          "title": "{EXT-SelfiesViewer_displayDelay}",
          "default": 10000,
          "enum": [5000,10000,15000,20000,25000,30000,35000,40000,45000,50000,55000,60000],
          "minimum": 5000,
          "maximum": 60000
        },
        "displayBackground": {
          "type": "boolean",
          "title": "{EXT-SelfiesViewer_displayBackground}",
          "default": false
        },
        "sortBy": {
          "type": "string",
          "title": "{EXT-SelfiesViewer_sortBy}",
          "default": "new",
          "enum": [
            "new",
            "old",
            "random"
          ]
        }
      }
    }
  },
  "required": ["module", "config"]
}

exports.default = defaultConfig
exports.schema = schema
