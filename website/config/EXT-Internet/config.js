var defaultConfig = {
  module: "EXT-Internet",
  position: "top_left",
  disabled: false,
  config: {
    debug: false,
    displayPing: true,
    delay: 30 * 1000,
    scan: "google.fr",
    showAlert: true,
    needRestart: false
  }
};

var schema = {
  title: "EXT-Internet",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-Internet"
    },
    position: {
      type: "string",
      title: "{PluginPosition}",
      default: "top_left",
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
        displayPing: {
          type: "boolean",
          title: "{EXT-Internet_Ping}",
          default: true
        },
        delay: {
          type: "number",
          title: "{EXT-Internet_Delay}",
          default: 30000
        },
        scan: {
          type: "string",
          title: "{EXT-Internet_Scan}",
          default: "google.fr"
        },
        showAlert: {
          type: "boolean",
          title: "{EXT-Internet_Alert}",
          default: true
        },
        needRestart: {
          type: "boolean",
          title: "{EXT-Internet_Restart}",
          default: false
        }
      }
    }
  },
  required: ["module", "position", "config"]
};

exports.default = defaultConfig;
exports.schema = schema;
