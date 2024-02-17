var defaultConfig = {
  module: "EXT-YouTubeCast",
  position: "top_center",
  disabled: false,
  config: {
    debug: false,
    fullscreen: false,
    width: "30vw",
    height: "30vh",
    alwaysDisplayed: true,
    castName: "MagicMirror",
    port: 8569
  }
};

var schema = {
  title: "EXT-YouTubeCast",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-YouTubeCast"
    },
    position: {
      type: "string",
      title: "{PluginPosition}",
      default: "top_center",
      enum: [
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
        fullscreen: {
          type: "boolean",
          title: "{EXT-YouTube_Fullscreen}",
          default: false
        },
        width: {
          type: "string",
          title: "{EXT-YouTube_Width}",
          default: "30vw"
        },
        height: {
          type: "string",
          title: "{EXT-YouTube_Height}",
          default: "30vh"
        },
        alwaysDisplayed: {
          type: "boolean",
          title: "{EXT-YouTube_Display}",
          default: true
        },
        castName: {
          type: "string",
          title: "{EXT-YouTubeCast_Name}",
          default: "MagicMirror"
        },
        port: {
          type: "number",
          title: "{EXT-YouTubeCast_Port}",
          default: 8569
        }
      },
      required: ["castName", "port"]
    }
  },
  required: ["module", "config", "position"]
};

exports.default = defaultConfig;
exports.schema = schema;
