var defaultConfig = {
  module: "EXT-TelegramBot",
  position: "top_left",
  disabled: false,
  config: {
    debug: false,
    telegramAPIKey: null,
    adminChatId: null,
    allowedUser: [],
    commandAllowed: {},
    useWelcomeMessage: true,
    useSoundNotification: true,
    TelegramBotServiceAlerte: true,
    favourites: ["/commands", "/modules", "/hideall", "/showall"],
    telecast: null,
    telecastLife: 1000 * 60 * 60 * 6,
    telecastLimit: 5,
    telecastHideOverflow: true,
    telecastContainer: 300,
    dateFormat: "DD-MM-YYYY HH:mm:ss"
  }
};

var schema = {
  title: "EXT-TelegramBot",
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
        telegramAPIKey: {
          title: "{EXT-TelegramBot_telegramAPIKey}",
          type: "string",
          default: null
        },
        adminChatId: {
          title: "{EXT-TelegramBot_adminChatId}",
          type: "number",
          default: null
        },
        allowedUser: {
          type: "array",
          title: "{EXT-TelegramBot_allowedUser}",
          default: [],
          minItems: 1
        },
        commandAllowed: {
          type: "object",
          title: "{EXT-TelegramBot_commandAllowed}",
          default: {}
        },
        useWelcomeMessage: {
          type: "boolean",
          title: "{EXT-TelegramBot_useWelcomeMessage}",
          default: true
        },
        useSoundNotification: {
          type: "boolean",
          title: "{EXT-TelegramBot_useSoundNotification}",
          default: true
        },
        TelegramBotServiceAlerte: {
          type: "boolean",
          title: "{EXT-TelegramBot_TelegramBotServiceAlerte}",
          default: true
        },
        favourites: {
          type: "array",
          title: "{EXT-TelegramBot_favourites}",
          default: [],
          minItems: 0
        },
        telecast: {
          type: ["number", "boolean", "null"],
          title: "{EXT-TelegramBot_telecast}",
          default: null
        },
        telecastLife: {
          title: "{EXT-TelegramBot_telecastLife}",
          type: "number",
          default: 1000 * 60 * 60 * 6
        },
        telecastLimit: {
          title: "{EXT-TelegramBot_telecastLimit}",
          type: "number",
          default: 5
        },
        telecastHideOverflow: {
          type: "boolean",
          title: "{EXT-TelegramBot_telecastHideOverflow}",
          default: true
        },
        telecastContainer: {
          title: "{EXT-TelegramBot_telecastContainer}",
          type: "number",
          default: 300
        },
        dateFormat: {
          title: "{EXT-TelegramBot_dateFormat}",
          type: "string",
          default: "DD-MM-YYYY HH:mm:ss",
          enum: [
            "DD-MM-YYYY HH:mm:ss",
            "YYYY-MM-DD HH:mm:ss"
          ]
        }
      },
      required: ["telegramAPIKey", "adminChatId", "allowedUser"]
    }
  },
  required: ["module", "position", "config"]
};

exports.default = defaultConfig;
exports.schema = schema;
