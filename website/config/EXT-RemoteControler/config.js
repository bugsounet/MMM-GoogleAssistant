var defaultConfig = {
  module: "EXT-RemoteControler",
  disabled: false,
  config: {
    debug: false,
    develop: false,
    keyFinder: false,
    type: "samsung",
    throttledTimeout: 250,
    keyMap: {
      amazon: {
        Home: "KEY_HOMEPAGE",
        Enter: "KEY_KPENTER",
        ArrowLeft: "KEY_LEFT",
        ArrowRight: "KEY_RIGHT",
        ArrowUp: "KEY_UP",
        ArrowDown: "KEY_DOWN",
        Menu: "KEY_MENU",
        PlayPause: "KEY_PLAYPAUSE",
        NextTrack: "KEY_FASTFORWARD",
        PreviousTrack: "KEY_REWIND",
        Return: "KEY_BACK"
      },
      samsung: {
        Power: 2,
        Mic: 160,
        123: 210,
        Colors: 206,
        Enter: 104,
        ArrowLeft: 101,
        ArrowRight: 98,
        ArrowUp: 96,
        ArrowDown: 97,
        Return: 88,
        Home: 121,
        PlayPause: 185,
        VolumeUp: 7,
        VolumeDown: 11,
        VolumeMute: 15,
        ChannelUp: 18,
        ChannelDown: 16,
        ChannelGuide: 79
      }
    },
    actions: [
      // type samsung
      {
        type: "samsung",
        key: "Power",
        notification: "EXT_SCREEN-FORCE_TOGGLE"
      },
      {
        type: "samsung",
        key: "Mic",
        notification: "GA_ACTIVATE"
      },
      {
        type: "samsung",
        key: "123",
        notification: "EXT_FREEBOXTV-PLAY",
        payload: "RMCDecouverte"
      },
      {
        type: "samsung",
        key: "Colors",
        notification: "GA_SYSINFO"
      },
      {
        type: "samsung",
        key: "ArrowLeft",
        notification: "EXT_PAGES-DECREMENT",
        sound: "turn"
      },
      {
        type: "samsung",
        key: "ArrowRight",
        notification: "EXT_PAGES-INCREMENT",
        sound: "turn2"
      },
      {
        type: "samsung",
        key: "Enter",
        notification: "GA_STOP"
      },
      {
        type: "samsung",
        key: "ArrowUp",
        notification: "EXT_SPOTIFY-NEXT"
      },
      {
        type: "samsung",
        key: "ArrowDown",
        notification: "EXT_SPOTIFY-PREVIOUS"
      },
      {
        type: "samsung",
        key: "Return",
        notification: "EXT_STOP",
        sound: "closing"
      },
      {
        type: "samsung",
        key: "Home",
        notification: "EXT_PAGES-HOME"
      },
      {
        type: "samsung",
        key: "PlayPause",
        notification: "EXT_SPOTIFY-PLAY-TOGGLE"
      },
      {
        type: "samsung",
        key: "VolumeUp",
        notification: "EXT_VOLUME-SPEAKER_UP",
        sound: "up"
      },
      {
        type: "samsung",
        key: "VolumeDown",
        notification: "EXT_VOLUME-SPEAKER_DOWN",
        sound: "down"
      },
      {
        type: "samsung",
        key: "VolumeMute",
        notification: "EXT_VOLUME-SPEAKER_MUTE_TOGGLE"
      },
      {
        type: "samsung",
        key: "ChannelUp",
        notification: "EXT_FREEBOXTV-NEXT"
      },
      {
        type: "samsung",
        key: "ChannelDown",
        notification: "EXT_FREEBOXTV-PREVIOUS"
      },
      {
        type: "samsung",
        key: "ChannelGuide",
        notification: "EXT_FREEBOXTV-STOP"
      },

      // type amazon
      {
        type: "amazon",
        key: "ArrowLeft",
        state: "KEY_PRESSED",
        notification: "EXT_PAGES-DECREMENT",
        sound: "turn"
      },
      {
        type: "amazon",
        key: "ArrowRight",
        state: "KEY_PRESSED",
        notification: "EXT_PAGES-INCREMENT",
        sound: "turn2"
      },
      {
        type: "amazon",
        key: "Enter",
        state: "KEY_PRESSED",
        notification: "GA_ACTIVATE"
      },
      {
        type: "amazon",
        key: "Enter",
        state: "KEY_LONGPRESSED",
        notification: "GA_STOP"
      },
      {
        type: "amazon",
        key: "ArrowUp",
        state: "KEY_PRESSED",
        notification: "EXT_VOLUME-SPEAKER_UP",
        sound: "up"
      },
      {
        type: "amazon",
        key: "ArrowDown",
        state: "KEY_PRESSED",
        notification: "EXT_VOLUME-SPEAKER_DOWN",
        sound: "down"
      },
      {
        type: "amazon",
        key: "Return",
        state: "KEY_PRESSED",
        notification: "EXT_STOP",
        sound: "closing"
      },
      {
        type: "amazon",
        key: "Home",
        state: "KEY_PRESSED",
        notification: "EXT_PAGES-HOME"
      },
      {
        type: "amazon",
        key: "Menu",
        state: "KEY_PRESSED",
        notification: "EXT_SCREEN-FORCE_WAKEUP"
      },
      {
        type: "amazon",
        key: "Menu",
        state: "KEY_LONGPRESSED",
        notification: "EXT_SCREEN-FORCE_END"
      },
      {
        type: "amazon",
        key: "PreviousTrack",
        state: "KEY_PRESSED",
        notification: "EXT_SPOTIFY-PREVIOUS"
      },
      {
        type: "amazon",
        key: "PlayPause",
        state: "KEY_PRESSED",
        notification: "EXT_SPOTIFY-PLAY"
      },
      {
        type: "amazon",
        key: "PlayPause",
        state: "KEY_LONGPRESSED",
        notification: "EXT_SPOTIFY-PAUSE"
      },
      {
        type: "amazon",
        key: "NextTrack",
        state: "KEY_PRESSED",
        notification: "EXT_SPOTIFY-NEXT"
      }
    ]
  }
};
var schema = {
  title: "EXT-RemoteControler",
  description: "{PluginDescription}",
  type: "object",
  properties: {
    module: {
      type: "string",
      title: "{PluginName}",
      default: "EXT-RemoteControler"
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
