var defaultConfig = {
  module: "EXT-Background",
  disabled: false,
  config: {
    model: "jarvis",
    myImage: null
  }
};

var schema = {
  title: "EXT-Background",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-Background"
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
        model: {
          type: "string",
          title: "{EXT-Background_Model}",
          default: "jarvis",
          enum: ["jarvis", "lego", "old", "cortana"]
        },
        myImage: {
          type: ["string", "null"],
          title: "{EXT-Background_Image}",
          default: null
        }
      },
      required: ["model"]
    }
  },
  required: ["config", "module"]
};

exports.default = defaultConfig;
exports.schema = schema;
