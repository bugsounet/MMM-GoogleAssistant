var defaultConfig = {
  module: 'EXT-GooglePhotos',
  position: 'top_left',
  disabled: false,
  config: {
    debug: false,
    displayType: 0,
    displayDelay: 10 * 1000,
    displayInfos: true,
    displayBackground: true,
    albums: [],
    sort: "new", // "old", "random"
    hiResolution: true,
    timeFormat: "DD/MM/YYYY HH:mm",
    moduleHeight: 300,
    moduleWidth: 300,
    uploadAlbum: null
  }
}

var schema = {
  "title": "EXT-GooglePhotos",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-GooglePhotos"
    },
    "position": {
      "type": "string",
      "title": "{PluginPosition}",
      "default": "top_left",
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
        "displayType": {
          "type": "number",
          "title": "{EXT-GooglePhotos_Type}",
          "default": 0,
          "enum": [ 0 , 1 ],
          "minimum": 0,
          "maximum": 1
        },
        "displayDelay": {
          "type": "number",
          "title": "{EXT-GooglePhotos_Delay}",
          "default": 10000
        },
        "displayInfos": {
          "type": "boolean",
          "title": "{EXT-GooglePhotos_Infos}",
          "default": true
        },
        "displayBackground": {
          "type": "boolean",
          "title": "{EXT-GooglePhotos_Background}",
          "default": true
        },
        "albums": {
          "type": "array",
          "title": "{EXT-GooglePhotos_Albums}",
          "default": [],
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "type": "string"
          }
        },
        "sort": {
          "type": "string",
          "title": "{EXT-GooglePhotos_Sort}",
          "default": "new",
          "enum": [ "new", "old" , "random" ]
        },
        "hiResolution": {
          "type": "boolean",
          "title": "{EXT-GooglePhotos_HD}",
          "default": true
        },
        "timeFormat": {
          "type": "string",
          "title": "{EXT-GooglePhotos_Format}",
          "default": "DD/MM/YYYY HH:mm",
          "enum": [ "DD/MM/YYYY HH:mm", "DD/MM/YYYY" , "YYYY/DD/MM HH:mm" , "YYYY/DD/MM"  ]
        },
        "moduleHeight": {
          "type": "number",
          "title": "{EXT-GooglePhotos_Height}",
          "default": 10000
        },
        "moduleWidth": {
          "type": "number",
          "title": "{EXT-GooglePhotos_Width}",
          "default": 10000
        },
        "uploadAlbum": {
          "type": ["string", "null"],
          "title": "{EXT-GooglePhotos_uploadAlbum}",
          "default": null
        }
      },
      "required": ["albums"]
    }
  },
  "required": ["module", "config", "position"]
}

exports.default = defaultConfig
exports.schema = schema
