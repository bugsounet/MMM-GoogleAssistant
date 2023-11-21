var defaultConfig = {
  module: 'EXT-Bring',
  position: 'top_right',
  disabled: false,
  config: {
    debug: false,
    listName: "Liste",
    email: null,
    password: null,
    lang: 0,
    columns: 3,
    maxRows: 5,
    updateInterval: 30000,
    showBackground: true,
    showBox: true,
    showHeader: true
  }
}

var schema = {
  "title": "EXT-Bring",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-Bring"
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
        "listName": {
          "type": "string",
          "title": "{EXT-Bring_List}",
          "default": "Liste"
        },
        "email": {
          "type": "string",
          "title": "{EXT-Bring_Email}",
          "format": "email"
        },
        "password": {
          "type": "string",
          "title": "{EXT-Bring_Password}",
          "default": "secret"
        },
        "lang": {
          "type": "number",
          "title": "{EXT-Bring_Language}",
          "default": 0,
          "enum": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
          "minimum": 0,
          "maximum": 20
        },
        "columns": {
          "type": "number",
          "title": "{EXT-Bring_Colums}",
          "default": 0,
          "enum": [0,1,2,3,4,5,6,7,8,9,10],
          "minimum": 1,
          "maximum": 10
        },
        "maxRows": {
          "type": "number",
          "title": "{EXT-Bring_Rows}",
          "default": 0,
          "enum": [0,1,2,3,4,5,6,7,8,9,10],
          "minimum": 1,
          "maximum": 10
        },
        "updateInterval": {
          "type": "number",
          "title": "{EXT-Bring_Update}",
          "default": 30000,
          "enum": [15000,30000,60000,90000,120000],
          "minimum": 15000,
          "maximum": 120000
        },
        "showBackground": {
          "type": "boolean",
          "title": "{EXT-Bring_Background}",
          "default": true
        },
        "showBox": {
          "type": "boolean",
          "title": "{EXT-Bring_Box}",
          "default": true
        },
        "showHeader": {
          "type": "boolean",
          "title": "{EXT-Bring_Header}",
          "default": true
        }
      },
      "required": ["email","password"]
    }
  },
  "required": ["config","module", "position"]
}

exports.default = defaultConfig
exports.schema = schema
