var defaultConfig = {
  module: "EXT-Alert",
  disabled: false,
  config: {
    debug: false,
    style: 1,
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
        style: {
          type: "number",
          title: "{EXT-Alert_style}",
          default: 1,
          enum: [0, 1, 2],
          minimum: 0,
          maximum: 2
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
