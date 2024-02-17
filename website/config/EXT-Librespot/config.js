var defaultConfig = {
  module: "EXT-Librespot",
  disabled: false,
  config: {
    debug: false,
    email: "",
    password: "",
    deviceName: "MagicMirror",
    minVolume: 50,
    maxVolume: 100
  }
};

var schema = {
  title: "EXT-Librespot",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-Librespot"
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
        email: {
          type: "string",
          title: "{EXT-Librespot_Email}",
          format: "email",
          default: null
        },
        password: {
          type: "string",
          title: "{EXT-Librespot_Password}",
          default: null
        },
        deviceName: {
          type: "string",
          title: "{EXT-Librespot_Name}",
          default: "MagicMirror"
        },
        minVolume: {
          type: "number",
          title: "{EXT-Librespot_Min}",
          default: 50,
          minimum: 0,
          maximum: 100
        },
        maxVolume: {
          type: "number",
          title: "{EXT-Librespot_Max}",
          default: 100,
          minimum: 1,
          maximum: 100
        }
      },
      required: ["email", "password", "deviceName"]
    }
  },
  required: ["module", "config"]
};

exports.default = defaultConfig;
exports.schema = schema;
