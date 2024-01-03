var defaultConfig = {
  module: "EXT-StreamDeck",
  disabled: false,
  config: {
    debug: false,
    device: null,
    Brightness: 100,
    EcoBrightness: 10,
    EcoTime: 10000,
    keyFinder: false,
    keys: [
      {
        key: 0,
        logo: "tv-on",
        notification: "EXT_SCREEN-WAKEUP",
        payload: null,
        command: null,
        sound: "opening"
      },
      {
        key: 1,
        logo: "spotify",
        notification: "EXT_SPOTIFY-PLAY",
        payload: null,
        command: null,
        sound: "opening"
      },
      {
        key: 2,
        logo: "volume-up",
        notification: "EXT_VOLUME-SPEAKER_UP",
        payload: null,
        command: null,
        sound: "up"
      },
      {
        key: 3,
        logo: "tv-off",
        notification: "EXT_SCREEN-END",
        payload: null,
        command: null,
        sound: "closing"
      },
      {
        key: 4,
        logo: "stop",
        notification: "EXT_STOP",
        payload: null,
        command: null,
        sound: "closing"
      },
      {
        key: 5,
        logo: "volume-down",
        notification: "EXT_VOLUME-SPEAKER_DOWN",
        payload: null,
        command: null,
        sound: "down"
      }
    ]
  }
}

var schema = {
  "title": "EXT-StreamDeck",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-StreamDeck"
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
        "device": {
          "type": ["string", "null"],
          "title": "{EXT-StreamDeck_device}",
          "default": null
        },
        "Brightness": {
          "type": "number",
          "title": "{EXT-StreamDeck_brightness}",
          "default": 100,
          "enum": [
            0,
            5,
            10,
            15,
            20,
            25,
            30,
            35,
            40,
            45,
            50,
            55,
            60,
            65,
            70,
            75,
            80,
            85,
            90,
            95,
            100
          ]
        },
        "EcoBrightness": {
          "type": "number",
          "title": "{EXT-StreamDeck_ecobrightness}",
          "default": 10,
          "enum": [
            0,
            5,
            10,
            15,
            20,
            25,
            30,
            35,
            40,
            45,
            50,
            55,
            60,
            65,
            70,
            75,
            80,
            85,
            90,
            95,
            100
          ]
        },
        "EcoTime": {
          "type": "number",
          "title": "{EXT-StreamDeck_ecotime}",
          "default": 10000,
          "enum": [
            5000,
            10000,
            15000,
            20000,
            25000,
            30000
          ]
        },
        "keyFinder": {
          "type": "boolean",
          "title": "{EXT-Keyboard_keyFinder}",
          "default": false
        },
        "keys": {
          "type": "array",
          "title": "{EXT-Keyboard_keys}",
          "default": [],
          "minItems": 1,
          "items": {
            "properties": {
              "key": {
                 "type": "number",
                 "title": "{EXT-Keyboard_keycode}",
                 "enum": [
                  0,
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9,
                  10,
                  11,
                  12,
                  13,
                  14,
                  15,
                  16,
                  17,
                  18,
                  19,
                  20,
                  21,
                  22,
                  23,
                  24,
                  25,
                  26,
                  27,
                  28,
                  29,
                  30,
                  31,
                  32
                ]
              },
              "logo": {
                 "type": "string",
                 "title": "{EXT-StreamDeck_logo}",
              },
              "notification": {
                "type": ["string", "null"],
                "title": "{EXT-Keyboard_notification}",
              },
              "payload": {
                "type": ["string", "null"],
                "title": "{EXT-Keyboard_payload}",
                "default": null
              },
              "command": {
                "title": "{EXT-Keyboard_command}",
                "type": ["string", "null"],
                "default": null
              },
              "sound": {
                "title": "{EXT-Keyboard_sound}",
                "type": ["string", "null"],
                "default": null
              }
            },
            "required": ["key", "logo"]
          },
          "additionalItems": {
            "properties": {
              "key": {
                "type": "number"
              },
              "logo": {
                "type": "string"
              },
              "notification": {
                "type": ["string", "null"]
              },
              "payload": {
                "type": ["string", "null"]
              },
              "command": {
                "type": ["string", "null"]
              },
              "sound": {
                "type": ["string", "null"]
              }
            }
          }
        }
      }
    }
  },
  "required": ["module", "config"]
}

exports.default = defaultConfig
exports.schema = schema
