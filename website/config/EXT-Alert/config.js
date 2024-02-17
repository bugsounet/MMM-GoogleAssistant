var defaultConfig = {
  module: "EXT-Alert",
  disabled: false,
  config: {
    debug: false,
    ignore: []
  }
};

var schema = {
  title: "EXT-Alert",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-Alert"
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
        ignore: {
          type: "array",
          title: "{EXT-Alert_ignore}",
          default: []
        }
      }
    }
  },
  required: ["module"]
};

exports.default = defaultConfig;
exports.schema = schema;
