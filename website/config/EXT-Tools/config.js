var defaultConfig = {
  module: "EXT-Tools",
  position: "top_left",
  disabled: false
};

var schema = {
  title: "EXT-Touch",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-Detector"
    },
    position: {
      type: "string",
      title: "{PluginPosition}",
      default: "top_right",
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
    }
  },
  required: ["module", "position"]
};

exports.default = defaultConfig;
exports.schema = schema;
