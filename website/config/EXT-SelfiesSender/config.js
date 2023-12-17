var defaultConfig = {
  module: 'EXT-SelfiesSender',
  disabled: false,
  config: {
    debug: false,
    sendTelegramBotAuto: true,
    sendGooglePhotos: false,
    sendGooglePhotosAuto: false,
    sendMail: false,
    sendMailAuto: false,
    sendMailConfig: {
      transport: {
        host: 'smtp.mail.com',
        port: 465,
        secure: true,
        auth: {
          user: "youremail@mail.com",
          pass: "your mail password"
        }
      },
      message: {
        from: "youremail@mail.com",
        to: "who@where.com",
        subject: "EXT-SelfieSender -- This is your new selfie.",
        text: "New selfie.",
      }
    }
  }
}

var schema = {
  "title": "EXT-SelfiesSender",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-SelfiesSender"
    },
    "disabled": {
      "type": "boolean",
      "title": "{PluginDisable}",
      "default": false
    },
    "config": {
      "type": "object",
      "title": "{PluginConfiguration}",
      "properties": {
        "debug": {
          "type": "boolean",
          "title": "{PluginDebug}",
          "default": false
        },
        "sendTelegramBotAuto": {
          "type": "boolean",
          "title": "{EXT-SelfiesSender_sendTelegramBotAuto}",
          "default": false
        },
        "sendGooglePhotos": {
          "type": "boolean",
          "title": "{EXT-SelfiesSender_sendGooglePhotos}",
          "default": false
        },
        "sendGooglePhotosAuto": {
          "type": "boolean",
          "title": "{EXT-SelfiesSender_sendGooglePhotosAuto}",
          "default": false
        },
        "sendMail": {
          "type": "boolean",
          "title": "{EXT-SelfiesSender_sendMail}",
          "default": false
        },
        "sendMailAuto": {
          "type": "boolean",
          "title": "{EXT-SelfiesSender_sendMailAuto}",
          "default": false
        },
        "sendMailConfig": {
          "type": ["object", "null"],
          "title": "{EXT-SelfiesSender_sendMailConfig}",
          "properties": {
            "transport": {
              "type": "object",
              "title": "{EXT-SelfiesSender_transport}",
              "properties": {
                "host": {
                  "type": "string",
                  "title": "{EXT-SelfiesSender_host}",
                  "default": "smtp.mail.com",
                  "format": "hostname",
                },
                "port": {
                  "type": "number",
                  "title": "{EXT-SelfiesSender_port}",
                  "default": 465,
                  "minimum": 1,
                  "maximum": 65535
                },
                "secure": {
                  "type": "boolean",
                  "title": "{EXT-SelfiesSender_secure}",
                  "default": true
                },
                "auth": {
                  "type": ["object"],
                  "title": "{EXT-SelfiesSender_auth}",
                  "properties": {
                    "user": {
                      "type": "string",
                      "title": "{EXT-SelfiesSender_user}",
                      "default": "youremail@mail.com"
                    },
                    "pass": {
                      "type": "string",
                      "title": "{EXT-SelfiesSender_pass}",
                      "default": "your mail password"
                    }
                  },
                  "required": ["user", "pass"]
                }
              },
              "required": ["host", "port", "secure", "auth"]
            },
            "message": {
              "type": "object",
              "title": "{EXT-SelfiesSender_message}",
              "properties": {
                "from": {
                  "type": "string",
                  "title": "{EXT-SelfiesSender_from}",
                  "format": "email",
                  "minLength": 6,
                  "default": "youremail@mail.com",
                },
                "to": {
                  "type": "string",
                  "title": "{EXT-SelfiesSender_to}",
                  "format": "email",
                  "minLength": 6,
                  "default": "who@where.com",
                },
                "subject": {
                  "type": "string",
                  "title": "{EXT-SelfiesSender_subject}",
                  "default": "EXT-SelfieSender -- This is your new selfie.",
                },
                "text": {
                  "type": "string",
                  "title": "{EXT-SelfiesSender_text}",
                  "default": "New selfie."
                }
              },
              "required": ["from", "to", "subject", "text"]
            }
          },
          "required": ["transport", "message"]
        }
      }
    }
  },
  "required": ["module", "config"]
}

exports.default = defaultConfig
exports.schema = schema
