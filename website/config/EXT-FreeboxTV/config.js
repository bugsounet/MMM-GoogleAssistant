var defaultConfig = {
  module: 'EXT-FreeboxTV',
  position: 'top_left',
  configDeepMerge: true,
  disabled: false,
  config: {
    debug: false,
    fullscreen: true,
    width: 384,
    height: 216,
    streams: "streamsConfig.json",
    volume : {
      start: 100,
      min: 30,
      useLast: true
    }
  }
}

// only for French users ... no translation others translation

var schema = {
  "title": "EXT-FreeboxTV",
  "description": "Propriété du plugin EXT-FreeboxTV",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "Nom du Plugin",
      "default": "EXT-FreeboxTV"
    },
    "position": {
      "type": "string",
      "title": "Position du plugin",
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
    "configDeepMerge": {
      "type": "boolean",
      "title": "Fusionner automatiquement avec la configuration par défaut si une fonctionnalitée manque dans la configuration",
      "default": true
    },
    "disabled": {
      "type": "boolean",
      "title": "Désactive le plugin",
      "default": false
    },
    "config": {
      "type": "object",
      "title": "Configuration",
      "properties": {
        "debug": {
          "type": "boolean",
          "title": "Active le mode debug",
          "default": false
        },
        "fullscreen": {
          "type": "boolean",
          "title": "Affiche la chaine de TV en plein écran",
          "default": false
        },
        "width": {
          "type": "number",
          "title": "Largeur de la fenetre d'affichage en px",
          "default": 384
        },
        "height": {
          "type": "number",
          "title": "Hauteur de la fenetre d'affichage en px",
          "default": 216
        },
        "streams": {
          "type": "string",
          "title": "Nom du fichier contenant les streams des chaines (format JSON)",
          "default": "streamsConfig.json"
        },
        "volume": {
          "type": "object",
          "title": "Configuration du volume",
          "properties": {
            "start": {
              "type": "number",
              "title": "Volume au démarrage TV (entre 0 et 100)",
              "default": 100
            },
            "min": {
              "type": "number",
              "title": "Volume en cas d'utilisation de l'assistant",
              "default": 30
            },
            "useLast": {
              "type": "boolean",
              "title": "Memorise le dernier volume utilisé",
              "default": true
            }
          }
        }
      }
    }
  },
  "required": ["module", "configDeepMerge"]
}

exports.default = defaultConfig
exports.schema = schema
