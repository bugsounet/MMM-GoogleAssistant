var defaultConfig = {
  module: "EXT-Keyboard",
  disabled: false,
  config: {
    debug: false,
    keyFinder: false,
    keys: [
      {
        keyCode: 107,
        notification: "EXT_VOLUME-SPEAKER_UP",
        payload: null,
        command: null,
        sound: "up"
      },
      {
        keyCode: 109,
        notification: "EXT_VOLUME-SPEAKER_DOWN",
        payload: null,
        command: null,
        sound: "down"
      }
    ]
  }
};

var schema = {
  title: "EXT-Keyboard",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-Keyboard"
    },
    disabled: {
      type: "boolean",
      title: "{PluginDisable}",
      default: false
    },
    config: {
      type: "object",
      title: "{PluginConfiguration}",
      properties: {
        debug: {
          type: "boolean",
          title: "{PluginDebug}",
          default: false
        },
        keyFinder: {
          type: "boolean",
          title: "{EXT-Keyboard_keyFinder}",
          default: false
        },
        keys: {
          type: "array",
          title: "{EXT-Keyboard_keys}",
          default: [],
          minItems: 1,
          items: {
            properties: {
              keyCode: {
                type: "number",
                title: "{EXT-Keyboard_keycode}"
              },
              notification: {
                type: ["string", "null"],
                title: "{EXT-Keyboard_notification}"
              },
              payload: {
                type: ["string", "null"],
                title: "{EXT-Keyboard_payload}",
                default: null
              },
              command: {
                title: "{EXT-Keyboard_command}",
                type: ["string", "null"],
                default: null
              },
              sound: {
                title: "{EXT-Keyboard_sound}",
                type: ["string", "null"],
                default: null
              }
            },
            required: ["keyCode"]
          },
          additionalItems: {
            properties: {
              keyCode: {
                type: "number"
              },
              notification: {
                type: ["string", "null"]
              },
              payload: {
                type: ["string", "null"]
              },
              command: {
                type: ["string", "null"]
              },
              sound: {
                type: ["string", "null"]
              }
            }
          }
        }
      }
    }
  },
  required: ["module", "config"]
};

exports.default = defaultConfig;
exports.schema = schema;
