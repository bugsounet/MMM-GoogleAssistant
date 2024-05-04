var defaultConfig = {
  module: "EXT-VLCServer",
  disabled: false,
  config: {
    debug: false,
    vlcPath: "/usr/bin"
  }
};

var schema = {
  title: "EXT-VLCServer",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-VLCServer"
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
        vlcPath: {
          type: "string",
          title: "Default VLC Path",
          default: "/usr/bin",
        }
      }
    }
  },
  required: ["module"]
};

exports.default = defaultConfig;
exports.schema = schema;
