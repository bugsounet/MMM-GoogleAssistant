class smarthome {
  constructor(config, cb = ()=> {}) {
    this.SmartHome = {
      lang: "en",
      use: false,
      init: false,
      last_code: null,
      last_code_user: null,
      last_code_time: null,
      user: { user: "admin", password: "admin", devices: [ "MMM-GoogleAssistant" ] },
      actions: null,
      device: {},
      EXT: {},
      smarthome: {},
      oldSmartHome: {},
      homegraph: null
    }
  }


}

module.exports=smarthome
