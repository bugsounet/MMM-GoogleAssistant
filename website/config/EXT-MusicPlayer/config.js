var defaultConfig = {
  module: 'EXT-MusicPlayer',
  position: 'top_left',
  animateIn: "flipInX",
  animateOut: "flipOutX",
  disabled: false,
  config: {
    debug: false,
    useUSB: false,
    musicPath: "/home/pi/Music",
    checkSubDirectory: false,
    autoStart: false,
    minVolume: 30,
    maxVolume: 100
  }
}

var schema = {
  "title": "EXT-MusicPlayer",
  "description": "{PluginDescription}",
  "type": "object",
  "properties": {
    "module": {
      "type": "string",
      "title": "{PluginName}",
      "default": "EXT-MusicPlayer"
    },
    "position": {
      "type": "string",
      "title": "{PluginPosition}",
      "default": "top_right",
      "enum": [
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
    "animateIn": {
      "type": "string",
      "title": "{PluginAnimateIn}",
      "default": "flipInX",
      "enum": [
        "bounce",
        "flash",
        "pulse",
        "rubberBand",
        "shakeX",
        "shakeY",
        "headShake",
        "swing",
        "tada",
        "wobble",
        "jello",
        "heartBeat",
        "backInDown",
        "backInLeft",
        "backInRight",
        "backInUp",
        "bounceIn",
        "bounceInDown",
        "bounceInLeft",
        "bounceInRight",
        "bounceInUp",
        "fadeIn",
        "fadeInDown",
        "fadeInDownBig",
        "fadeInLeft",
        "fadeInLeftBig",
        "fadeInRight",
        "fadeInRightBig",
        "fadeInUp",
        "fadeInUpBig",
        "fadeInTopLeft",
        "fadeInTopRight",
        "fadeInBottomLeft",
        "fadeInBottomRight",
        "flip",
        "flipInX",
        "flipInY",
        "lightSpeedInRight",
        "lightSpeedInLeft",
        "rotateIn",
        "rotateInDownLeft",
        "rotateInDownRight",
        "rotateInUpLeft",
        "rotateInUpRight",
        "jackInTheBox",
        "rollIn",
        "zoomIn",
        "zoomInDown",
        "zoomInLeft",
        "zoomInRight",
        "zoomInUp",
        "slideInDown",
        "slideInLeft",
        "slideInRight",
        "slideInUp"
      ]
    },
    "animateOut": {
      "type": "string",
      "title": "{PluginAnimateOut}",
      "default": "flipOutX",
      "enum": [
        "backOutDown",
        "backOutLeft",
        "backOutRight",
        "backOutUp",
        "bounceOut",
        "bounceOutDown",
        "bounceOutLeft",
        "bounceOutRight",
        "bounceOutUp",
        "fadeOut",
        "fadeOutDown",
        "fadeOutDownBig",
        "fadeOutLeft",
        "fadeOutLeftBig",
        "fadeOutRight",
        "fadeOutRightBig",
        "fadeOutUp",
        "fadeOutUpBig",
        "fadeOutTopLeft",
        "fadeOutTopRight",
        "fadeOutBottomRight",
        "fadeOutBottomLeft",
        "flipOutX",
        "flipOutY",
        "lightSpeedOutRight",
        "lightSpeedOutLeft",
        "rotateOut",
        "rotateOutDownLeft",
        "rotateOutDownRight",
        "rotateOutUpLeft",
        "rotateOutUpRight",
        "hinge",
        "rollOut",
        "zoomOut",
        "zoomOutDown",
        "zoomOutLeft",
        "zoomOutRight",
        "zoomOutUp",
        "slideOutDown",
        "slideOutLeft",
        "slideOutRight",
        "slideOutUp"
      ]
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
        "useUSB": {
          "type": "boolean",
          "title": "{EXT-MusicPlayer_USB}",
          "default": false
        },
        "musicPath": {
          "type": "string",
          "title": "{EXT-MusicPlayer_Path}",
          "default": "/home/pi/Music"
        },
        "checkSubDirectory": {
          "type": "boolean",
          "title": "{EXT-MusicPlayer_Check}",
          "default": false
        },
        "autoStart": {
          "type": "boolean",
          "title": "{EXT-MusicPlayer_Start}",
          "default": false
        },
        "minVolume": {
          "type": "number",
          "title": "{EXT-MusicPlayer_Min}",
          "default": 30,
          "minimum": 0,
          "maximum": 100
        },
        "maxVolume": {
          "type": "number",
          "title": "{EXT-MusicPlayer_Max}",
          "default": 100,
          "minimum": 1,
          "maximum": 100
        }
      }
    }
  },
  "required": ["module", "config", "position"]
}

exports.default = defaultConfig
exports.schema = schema
