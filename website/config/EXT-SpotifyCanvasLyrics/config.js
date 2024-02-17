var defaultConfig = {
  module: "EXT-SpotifyCanvasLyrics",
  disabled: false
};

var schema = {
  title: "EXT-SpotifyCanvasLyrics",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-SpotifyCanvasLyrics"
    },
    disabled: {
      type: "boolean",
      title: "{PluginDisable}",
      default: false
    }
  },
  required: ["module"]
};

exports.default = defaultConfig;
exports.schema = schema;
