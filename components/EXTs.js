/*********************/
/** EXTs Management **/
/*********************/
class EXTs {
  constructor (Tools) {
    this.translate = (...args) => Tools.translate(...args)
    this.sendNotification = (...args) => Tools.sendNotification(...args)
    this.sendSocketNotification = (...args) => Tools.sendSocketNotification(...args)
    this.notificationReceived = (...args) => Tools.notificationReceived(...args)

    this.ExtDB = [
      "EXT-Alert",
      "EXT-Background",
      "EXT-Bring",
      "EXT-Browser",
      "EXT-Detector",
      "EXT-FreeboxTV",
      "EXT-GooglePhotos",
      "EXT-Governor",
      "EXT-Internet",
      "EXT-Keyboard",
      "EXT-Librespot",
      "EXT-MusicPlayer",
      "EXT-Motion",
      "EXT-Pages",
      "EXT-Photos",
      "EXT-Pir",
      "EXT-RadioPlayer",
      "EXT-Screen",
      "EXT-Selfies",
      "EXT-SelfiesFlash",
      "EXT-SelfiesSender",
      "EXT-SelfiesViewer",
      "EXT-Spotify",
      "EXT-SpotifyCanvasLyrics",
      "EXT-StreamDeck",
      "EXT-TelegramBot",
      "EXT-Updates",
      "EXT-Volume",
      "EXT-Welcome",
      "EXT-YouTube",
      "EXT-YouTubeCast"
    ]

    this.EXTTranslate = {}
    this.EXTDescription = {}
    this.VALTranslate = {}
    this.EXT = {
      GA_Ready: false
    }
    console.log("[GA] EXTs Ready")
  }

  async init() {
    return new Promise(async resolve => {
      this.createDB()
      await this.Load_EXT_Translation()
      await this.Load_EXT_Description()
      await this.Load_EXT_TrSchemaValidation()
      resolve()
    })
  }

  async createDB() {
    await Promise.all(this.ExtDB.map(Ext=> {
      this.EXT[Ext] = {
        hello: false,
        connected: false
      }
    }))
  
    /** special rules **/
    this.EXT["EXT-Motion"].started = false
    this.EXT["EXT-Pir"].started = false
    this.EXT["EXT-Screen"].power = true
    this.EXT["EXT-Updates"].update = {}
    this.EXT["EXT-Updates"].npm = {}
    this.EXT["EXT-Spotify"].remote = false
    this.EXT["EXT-Spotify"].play = false
    this.EXT["EXT-Volume"].speaker = 0
    this.EXT["EXT-Volume"].isMuted = false
    this.EXT["EXT-Volume"].recorder = 0
    this.EXT["EXT-SpotifyCanvasLyrics"].forced = false
    this.EXT["EXT-Pages"].actual = 0
    this.EXT["EXT-Pages"].total = 0
  }

  setGA_Ready() {
    this.EXT.GA_Ready = true
  }

  Get_EXT_Status() {
    return this.EXT
  }

  /** translations **/
  Load_EXT_Translation() {
    return new Promise(resolve => {
      this.EXTTranslate.Rotate_Msg = this.translate("GW_Rotate_Msg")
      this.EXTTranslate.Rotate_Continue = this.translate("GW_Rotate_Continue")

      this.EXTTranslate.Login_Welcome = this.translate("GW_Login_Welcome")
      this.EXTTranslate.Login_Username = this.translate("GW_Login_Username")
      this.EXTTranslate.Login_Password = this.translate("GW_Login_Password")
      this.EXTTranslate.Login_Error = this.translate("GW_Login_Error")
      this.EXTTranslate.Login_Login = this.translate("GW_Login_Login")

      this.EXTTranslate.Home = this.translate("GW_Home")
      this.EXTTranslate.Home_Welcome= this.translate("GW_Home_Welcome")

      this.EXTTranslate.Plugins = this.translate("GW_Plugins")
      this.EXTTranslate.Plugins_Welcome = this.translate("GW_Plugins_Welcome")
      this.EXTTranslate.Plugins_Table_Reset= this.translate("GW_Plugins_Table_Reset")
      this.EXTTranslate.Plugins_Table_Showing= this.translate("GW_Plugins_Table_Showing")
      this.EXTTranslate.Plugins_Table_Plugins= this.translate("GW_Plugins_Table_Plugins")
      this.EXTTranslate.Plugins_Table_Name= this.translate("GW_Plugins_Table_Name")
      this.EXTTranslate.Plugins_Table_Description= this.translate("GW_Plugins_Table_Description")
      this.EXTTranslate.Plugins_Table_Actions= this.translate("GW_Plugins_Table_Actions")
      this.EXTTranslate.Plugins_Table_Configuration= this.translate("GW_Plugins_Table_Configuration")
      this.EXTTranslate.Plugins_Table_Search= this.translate("GW_Plugins_Table_Search")
      this.EXTTranslate.Plugins_Table_Wiki = this.translate("GW_Plugins_Table_Wiki")
      this.EXTTranslate.Plugins_Table_Install = this.translate("GW_Plugins_Table_Install")
      this.EXTTranslate.Plugins_Table_Delete = this.translate("GW_Plugins_Table_Delete")
      this.EXTTranslate.Plugins_Table_Modify = this.translate("GW_Plugins_Table_Modify")
      this.EXTTranslate.Plugins_Table_Configure = this.translate("GW_Plugins_Table_Configure")
      this.EXTTranslate.Plugins_Table_DeleteConfig = this.translate("GW_Plugins_Table_DeleteConfig")
      this.EXTTranslate.Plugins_Delete_TerminalHeader = this.translate("GW_Plugins_Delete_TerminalHeader")
      this.EXTTranslate.Plugins_Delete_Message = this.translate("GW_Plugins_Delete_Message")
      this.EXTTranslate.Plugins_Delete_Progress = this.translate("GW_Plugins_Delete_Progress")
      this.EXTTranslate.Plugins_Delete_Confirmed = this.translate("GW_Plugins_Delete_Confirmed")
      this.EXTTranslate.Plugins_Install_TerminalHeader = this.translate("GW_Plugins_Install_TerminalHeader")
      this.EXTTranslate.Plugins_Install_Message = this.translate("GW_Plugins_Install_Message")
      this.EXTTranslate.Plugins_Install_Progress = this.translate("GW_Plugins_Install_Progress")
      this.EXTTranslate.Plugins_Install_Confirmed = this.translate("GW_Plugins_Install_Confirmed")
      this.EXTTranslate.Plugins_Initial_Title = this.translate("GW_Plugins_Initial_Title")
      this.EXTTranslate.Plugins_DeleteConfig_Title = this.translate("GW_Plugins_DeleteConfig_Title")
      this.EXTTranslate.Plugins_DeleteConfig_Confirmed = this.translate("GW_Plugins_DeleteConfig_Confirmed")
      this.EXTTranslate.Plugins_Modify_Title = this.translate("GW_Plugins_Modify_Title")
      this.EXTTranslate.Plugins_Error_Snowboy = this.translate("GW_Plugins_Error_Snowboy")
      this.EXTTranslate.Plugins_Error_Porcupine = this.translate("GW_Plugins_Error_Porcupine")

      this.EXTTranslate.Terminal = this.translate("GW_Terminal")
      this.EXTTranslate.TerminalOpen = this.translate("GW_TerminalOpen")
      this.EXTTranslate.TerminalGW = this.translate("GW_TerminalGW")

      this.EXTTranslate.Configuration = this.translate("GW_Configuration")
      this.EXTTranslate.Configuration_Welcome = this.translate("GW_Configuration_Welcome")
      this.EXTTranslate.Configuration_EditLoad = this.translate("GW_Configuration_EditLoad")
      this.EXTTranslate.Configuration_Edit_Title = this.translate("GW_Configuration_Edit_Title")
      this.EXTTranslate.Configuration_Edit_AcualConfig = this.translate("GW_Configuration_Edit_AcualConfig")

      this.EXTTranslate.Tools = this.translate("GW_Tools")
      this.EXTTranslate.Tools_Welcome = this.translate("GW_Tools_Welcome")
      this.EXTTranslate.Tools_subTitle = this.translate("GW_Tools_subTitle")
      this.EXTTranslate.Tools_Restart = this.translate("GW_Tools_Restart")
      this.EXTTranslate.Tools_Restart_Text1 = this.translate("GW_Tools_Restart_Text1")
      this.EXTTranslate.Tools_Restart_Text2 = this.translate("GW_Tools_Restart_Text2")
      this.EXTTranslate.Tools_Die = this.translate("GW_Tools_Die")
      this.EXTTranslate.Tools_Die_Text1 = this.translate("GW_Tools_Die_Text1")
      this.EXTTranslate.Tools_Die_Text2 = this.translate("GW_Tools_Die_Text2")
      this.EXTTranslate.Tools_Die_Text3 = this.translate("GW_Tools_Die_Text3")
      this.EXTTranslate.Tools_Webview_Header = this.translate("GW_Tools_Webview_Header")
      this.EXTTranslate.Tools_Webview_Needed = this.translate("GW_Tools_Webview_Needed")
      this.EXTTranslate.Tools_Backup_Found = this.translate("GW_Tools_Backup_Found")
      this.EXTTranslate.Tools_Backup_Text = this.translate("GW_Tools_Backup_Text")
      this.EXTTranslate.Tools_Backup_Deleted = this.translate("GW_Tools_Backup_Deleted")
      this.EXTTranslate.Tools_Screen_Text = this.translate("GW_Tools_Screen_Text")
      this.EXTTranslate.Tools_GoogleAssistant_Text = this.translate("GW_Tools_GoogleAssistant_Text")
      this.EXTTranslate.Tools_GoogleAssistant_Query = this.translate("GW_Tools_GoogleAssistant_Query")
      this.EXTTranslate.Tools_Alert_Text = this.translate("GW_Tools_Alert_Text")
      this.EXTTranslate.Tools_Alert_Query = this.translate("GW_Tools_Alert_Query")
      this.EXTTranslate.Tools_Volume_Text_Record = this.translate("GW_Tools_Volume_Text_Record")
      this.EXTTranslate.Tools_Volume_Text = this.translate("GW_Tools_Volume_Text")
      this.EXTTranslate.Tools_Volume_Text2 = this.translate("GW_Tools_Volume_Text2")
      this.EXTTranslate.Tools_Volume_Text3 = this.translate("GW_Tools_Volume_Text3")
      this.EXTTranslate.Tools_Spotify_Text = this.translate("GW_Tools_Spotify_Text")
      this.EXTTranslate.Tools_Spotify_Text2 = this.translate("GW_Tools_Spotify_Text2")
      this.EXTTranslate.Tools_Spotify_Query = this.translate("GW_Tools_Spotify_Query")
      this.EXTTranslate.Tools_Spotify_Artist = this.translate("GW_Tools_Spotify_Artist")
      this.EXTTranslate.Tools_Spotify_Track = this.translate("GW_Tools_Spotify_Track")
      this.EXTTranslate.Tools_Spotify_Album = this.translate("GW_Tools_Spotify_Album")
      this.EXTTranslate.Tools_Spotify_Playlist = this.translate("GW_Tools_Spotify_Playlist")
      this.EXTTranslate.Tools_Update_Header = this.translate("GW_Tools_Update_Header")
      this.EXTTranslate.Tools_Update_Text = this.translate("GW_Tools_Update_Text")
      this.EXTTranslate.Tools_Update_Text2 = this.translate("GW_Tools_Update_Text2")
      this.EXTTranslate.Tools_YouTube_Text = this.translate("GW_Tools_YouTube_Text")
      this.EXTTranslate.Tools_YouTube_Query = this.translate("GW_Tools_YouTube_Query")
      this.EXTTranslate.Tools_Stop_Text = this.translate("GW_Tools_Stop_Text")
      this.EXTTranslate.Tools_Radio_Text = this.translate("GW_Tools_Radio_Text")
      this.EXTTranslate.Tools_Radio_Text2 = this.translate("GW_Tools_Radio_Text2")

      this.EXTTranslate.About = this.translate("GW_About")
      this.EXTTranslate.About_Title = this.translate("GW_About_Title")
      this.EXTTranslate.About_Info_by = this.translate("GW_About_Info_by")
      this.EXTTranslate.About_Info_Support = this.translate("GW_About_Info_Support")
      this.EXTTranslate.About_Info_Donate = this.translate("GW_About_Info_Donate")
      this.EXTTranslate.About_Info_Donate_Text = this.translate("GW_About_Info_Donate_Text")
      this.EXTTranslate.About_Info_About = this.translate("GW_About_Info_About")
      this.EXTTranslate.About_Info_Translator = this.translate("GW_About_Info_Translator")
      this.EXTTranslate.About_Info_Translator1 = this.translate("GW_About_Info_Translator1")
      this.EXTTranslate.About_Info_Translator2 = this.translate("GW_About_Info_Translator2")
      this.EXTTranslate.About_Info_Translator3 = this.translate("GW_About_Info_Translator3")
      this.EXTTranslate.About_Info_Translator4 = this.translate("GW_About_Info_Translator4")
      this.EXTTranslate.About_Info_Translator5 = this.translate("GW_About_Info_Translator5")
      this.EXTTranslate.About_Info_Translator6 = this.translate("GW_About_Info_Translator6")
      this.EXTTranslate.About_Info_Translator7 = this.translate("GW_About_Info_Translator7")
      this.EXTTranslate.About_Info_Translator8 = this.translate("GW_About_Info_Translator8")
      this.EXTTranslate.About_Info_Translator9 = this.translate("GW_About_Info_Translator9")
      this.EXTTranslate.About_Info_Translator10 = this.translate("GW_About_Info_Translator10")

      this.EXTTranslate.System = this.translate("GW_System")
      this.EXTTranslate.System_Box_Shutdown = this.translate("GW_System_Box_Shutdown")
      this.EXTTranslate.System_Shutdown = this.translate("GW_System_Shutdown")
      this.EXTTranslate.System_Box_Restart = this.translate("GW_System_Box_Restart")
      this.EXTTranslate.System_Restart = this.translate("GW_System_Restart")
      this.EXTTranslate.System_Box_Version = this.translate("GW_System_Box_Version")
      this.EXTTranslate.System_GPUAcceleration_Disabled = this.translate("GW_System_GPUAcceleration_Disabled")
      this.EXTTranslate.System_GPUAcceleration_Enabled = this.translate("GW_System_GPUAcceleration_Enabled")
      this.EXTTranslate.System_NodeVersion = this.translate("GW_System_NodeVersion")
      this.EXTTranslate.System_NPMVersion = this.translate("GW_System_NPMVersion")
      this.EXTTranslate.System_OSVersion = this.translate("GW_System_OSVersion")
      this.EXTTranslate.System_KernelVersion = this.translate("GW_System_KernelVersion")
      this.EXTTranslate.System_CPUSystem = this.translate("GW_System_CPUSystem")
      this.EXTTranslate.System_TypeCPU = this.translate("GW_System_TypeCPU")
      this.EXTTranslate.System_SpeedCPU = this.translate("GW_System_SpeedCPU")
      this.EXTTranslate.System_CurrentLoadCPU = this.translate("GW_System_CurrentLoadCPU")
      this.EXTTranslate.System_GovernorCPU = this.translate("GW_System_GovernorCPU")
      this.EXTTranslate.System_TempCPU = this.translate("GW_System_TempCPU")
      this.EXTTranslate.System_MemorySystem = this.translate("GW_System_MemorySystem")
      this.EXTTranslate.System_TypeMemory = this.translate("GW_System_TypeMemory")
      this.EXTTranslate.System_SwapMemory = this.translate("GW_System_SwapMemory")
      this.EXTTranslate.System_NetworkSystem = this.translate("GW_System_NetworkSystem")
      this.EXTTranslate.System_IPNetwork = this.translate("GW_System_IPNetwork")
      this.EXTTranslate.System_InterfaceNetwork = this.translate("GW_System_InterfaceNetwork")
      this.EXTTranslate.System_SpeedNetwork = this.translate("GW_System_SpeedNetwork")
      this.EXTTranslate.System_DuplexNetwork = this.translate("GW_System_DuplexNetwork")
      this.EXTTranslate.System_WirelessInfo = this.translate("GW_System_WirelessInfo")
      this.EXTTranslate.System_SSIDNetwork = this.translate("GW_System_SSIDNetwork")
      this.EXTTranslate.System_RateNetwork = this.translate("GW_System_RateNetwork")
      this.EXTTranslate.System_FrequencyNetwork = this.translate("GW_System_FrequencyNetwork")
      this.EXTTranslate.System_SignalNetwork = this.translate("GW_System_SignalNetwork")
      this.EXTTranslate.System_QualityNetwork = this.translate("GW_System_QualityNetwork")
      this.EXTTranslate.System_StorageSystem = this.translate("GW_System_StorageSystem")
      this.EXTTranslate.System_MountStorage = this.translate("GW_System_MountStorage")
      this.EXTTranslate.System_UsedStorage = this.translate("GW_System_UsedStorage")
      this.EXTTranslate.System_PercentStorage = this.translate("GW_System_PercentStorage")
      this.EXTTranslate.System_TotalStorage = this.translate("GW_System_TotalStorage")
      this.EXTTranslate.System_UptimeSystem = this.translate("GW_System_UptimeSystem")
      this.EXTTranslate.System_CurrentUptime = this.translate("GW_System_CurrentUptime")
      this.EXTTranslate.System_System = this.translate("GW_System_System")
      this.EXTTranslate.System_RecordUptime = this.translate("GW_System_RecordUptime")
      this.EXTTranslate.System_DAY = this.translate("GW_System_DAY")
      this.EXTTranslate.System_DAYS = this.translate("GW_System_DAYS")
      this.EXTTranslate.System_HOUR = this.translate("GW_System_HOUR")
      this.EXTTranslate.System_HOURS = this.translate("GW_System_HOURS")
      this.EXTTranslate.System_MINUTE = this.translate("GW_System_MINUTE")
      this.EXTTranslate.System_MINUTES = this.translate("GW_System_MINUTES")
      this.EXTTranslate.System_ProcessSystem = this.translate("GW_System_ProcessSystem")
      this.EXTTranslate.System_CPU = this.translate("GW_System_CPU")
      this.EXTTranslate.System_Memory = this.translate("GW_System_Memory")
      this.EXTTranslate.System_CurrentlyRunning = this.translate("GW_System_CurrentlyRunning")
      this.EXTTranslate.System_NoPlugins = this.translate("GW_System_NoPlugins")
      this.EXTTranslate.System_NamePlugin = this.translate("GW_System_NamePlugin")
      this.EXTTranslate.System_VersionPlugin = this.translate("GW_System_VersionPlugin")
      this.EXTTranslate.System_RevPlugin = this.translate("GW_System_RevPlugin")

      this.EXTTranslate.Logout = this.translate("GW_Logout")

      this.EXTTranslate.Delete = this.translate("GW_Delete"),
      this.EXTTranslate.Install = this.translate("GW_Install"),
      this.EXTTranslate.Configure = this.translate("GW_Configure"),
      this.EXTTranslate.Modify = this.translate("GW_Modify")
      this.EXTTranslate.Save = this.translate("GW_Save")
      this.EXTTranslate.Wait = this.translate("GW_Wait")
      this.EXTTranslate.Done = this.translate("GW_Done")
      this.EXTTranslate.Error = this.translate("GW_Error")
      this.EXTTranslate.Cancel = this.translate("GW_Cancel")
      this.EXTTranslate.Confirm = this.translate("GW_Confirm")
      this.EXTTranslate.Load = this.translate("GW_Load")
      this.EXTTranslate.Restart = this.translate("GW_Restart")
      this.EXTTranslate.ErrModule = this.translate("GW_ErrModule")
      this.EXTTranslate.Warn_Error = this.translate("GW_Warn_Error")
      this.EXTTranslate.LoadDefault = this.translate("GW_LoadDefault"),
      this.EXTTranslate.MergeDefault = this.translate("GW_MergeDefault")
      this.EXTTranslate.Send = this.translate("GW_Send")
      this.EXTTranslate.TurnOn = this.translate("GW_TurnOn")
      this.EXTTranslate.TurnOff = this.translate("GW_TurnOff")
      this.EXTTranslate.RequestDone = this.translate("GW_RequestDone")
      this.EXTTranslate.Listen = this.translate("GW_Listen")
      this.EXTTranslate.Update = this.translate("GW_Update")
      this.EXTTranslate.Start = this.translate("GW_Start")
      resolve()
    })
  }

  Get_EXT_Translation() {
    return this.EXTTranslate
  }

  /** load descriptions **/
  Load_EXT_Description() {
    return new Promise(resolve => {
      this.EXTDescription["EXT-Alert"] = this.translate("EXT-Alert")
      this.EXTDescription["EXT-Background"] = this.translate("EXT-Background")
      this.EXTDescription["EXT-Bring"] = this.translate("EXT-Bring")
      this.EXTDescription["EXT-Browser"] = this.translate("EXT-Browser")
      this.EXTDescription["EXT-Detector"] = this.translate("EXT-Detector")
      this.EXTDescription["EXT-FreeboxTV"] = this.translate("EXT-FreeboxTV")
      this.EXTDescription["EXT-GooglePhotos"] = this.translate("EXT-GooglePhotos")
      this.EXTDescription["EXT-Governor"] = this.translate("EXT-Governor")
      this.EXTDescription["EXT-Internet"] = this.translate("EXT-Internet")
      this.EXTDescription["EXT-Keyboard"] = this.translate("EXT-Keyboard")
      this.EXTDescription["EXT-Librespot"] = this.translate("EXT-Librespot")
      this.EXTDescription["EXT-Motion"] = this.translate("EXT-Motion")
      this.EXTDescription["EXT-MusicPlayer"] = this.translate("EXT-MusicPlayer")
      this.EXTDescription["EXT-Pages"] = this.translate("EXT-Pages")
      this.EXTDescription["EXT-Photos"] = this.translate("EXT-Photos")
      this.EXTDescription["EXT-Pir"] = this.translate("EXT-Pir")
      this.EXTDescription["EXT-RadioPlayer"] = this.translate("EXT-RadioPlayer")
      this.EXTDescription["EXT-Selfies"] = this.translate("EXT-Selfies")
      this.EXTDescription["EXT-SelfiesFlash"] = this.translate("EXT-SelfiesFlash")
      this.EXTDescription["EXT-SelfiesSender"] = this.translate("EXT-SelfiesSender")
      this.EXTDescription["EXT-SelfiesViewer"] = this.translate("EXT-SelfiesViewer")
      this.EXTDescription["EXT-Screen"] = this.translate("EXT-Screen")
      this.EXTDescription["EXT-ScreenManager"] = this.translate("EXT-ScreenManager")
      this.EXTDescription["EXT-ScreenTouch"] = this.translate("EXT-ScreenTouch")
      this.EXTDescription["EXT-Spotify"] = this.translate("EXT-Spotify")
      this.EXTDescription["EXT-SpotifyCanvasLyrics"] = this.translate("EXT-SpotifyCanvasLyrics")
      this.EXTDescription["EXT-StreamDeck"] = this.translate("EXT-StreamDeck")
      this.EXTDescription["EXT-TelegramBot"] = this.translate("EXT-TelegramBot")
      this.EXTDescription["EXT-Updates"] = this.translate("EXT-Updates")
      this.EXTDescription["EXT-Volume"] = this.translate("EXT-Volume")
      this.EXTDescription["EXT-Welcome"] = this.translate("EXT-Welcome")
      this.EXTDescription["EXT-YouTube"] = this.translate("EXT-YouTube")
      this.EXTDescription["EXT-YouTubeCast"] = this.translate("EXT-YouTubeCast")
      resolve()
    })
  }

  Get_EXT_Description() {
    return this.EXTDescription
  }

  /** load schema validation translations **/
  Load_EXT_TrSchemaValidation() {
    return new Promise(resolve => {
      this.VALTranslate.PluginDescription = this.translate("VAL_PluginDescription")
      this.VALTranslate.PluginName = this.translate("VAL_PluginName")
      this.VALTranslate.PluginAnimateIn = this.translate("VAL_PluginAnimateIn")
      this.VALTranslate.PluginAnimateOut = this.translate("VAL_PluginAnimateOut")
      this.VALTranslate.PluginDisable = this.translate("VAL_PluginDisable")
      this.VALTranslate.PluginPosition = this.translate("VAL_PluginPosition")
      this.VALTranslate.PluginConfigDeepMerge = this.translate("VAL_PluginConfigDeepMerge")
      this.VALTranslate.PluginConfiguration = this.translate("VAL_PluginConfiguration")
      this.VALTranslate.PluginDebug = this.translate("VAL_PluginDebug")
      this.VALTranslate["EXT-Alert_ignore"] = this.translate("VAL_EXT-Alert_ignore")
      this.VALTranslate["EXT-Background_Model"] = this.translate("VAL_EXT-Background_Model")
      this.VALTranslate["EXT-Background_Image"] = this.translate("VAL_EXT-Background_Image")
      this.VALTranslate["EXT-Bring_List"] = this.translate("VAL_EXT-Bring_List")
      this.VALTranslate["EXT-Bring_Email"] = this.translate("VAL_EXT-Bring_Email")
      this.VALTranslate["EXT-Bring_Password"] = this.translate("VAL_EXT-Bring_Password")
      this.VALTranslate["EXT-Bring_Language"] = this.translate("VAL_EXT-Bring_Language")
      this.VALTranslate["EXT-Bring_Colums"] = this.translate("VAL_EXT-Bring_Colums")
      this.VALTranslate["EXT-Bring_Rows"] = this.translate("VAL_EXT-Bring_Rows")
      this.VALTranslate["EXT-Bring_Update"] = this.translate("VAL_EXT-Bring_Update")
      this.VALTranslate["EXT-Bring_Background"] = this.translate("VAL_EXT-Bring_Background")
      this.VALTranslate["EXT-Bring_Box"] = this.translate("VAL_EXT-Bring_Box")
      this.VALTranslate["EXT-Bring_Header"] = this.translate("VAL_EXT-Bring_Header")
      this.VALTranslate["EXT-Browser_Delay"] = this.translate("VAL_EXT-Browser_Delay")
      this.VALTranslate["EXT-Browser_Scroll"] = this.translate("VAL_EXT-Browser_Scroll")
      this.VALTranslate["EXT-Browser_Step"] = this.translate("VAL_EXT-Browser_Step")
      this.VALTranslate["EXT-Browser_Interval"] = this.translate("VAL_EXT-Browser_Interval")
      this.VALTranslate["EXT-Browser_Start"] = this.translate("VAL_EXT-Browser_Start")
      this.VALTranslate["EXT-Detector_Icon"] = this.translate("VAL_EXT-Detector_Icon")
      this.VALTranslate["EXT-Detector_Touch"] = this.translate("VAL_EXT-Detector_Touch")
      this.VALTranslate["EXT-Detector_Detector"] = this.translate("VAL_EXT-Detector_Detector")
      this.VALTranslate["EXT-Detector_Engine"] = this.translate("VAL_EXT-Detector_Engine")
      this.VALTranslate["EXT-Detector_Keyword"] = this.translate("VAL_EXT-Detector_Keyword")
      this.VALTranslate["EXT-Detector_Sensitivity"] = this.translate("VAL_EXT-Detector_Sensitivity")
      this.VALTranslate["EXT-Detector_AccessKey"] = this.translate("VAL_EXT-Detector_AccessKey")
      this.VALTranslate["EXT-Detector_CustomModel"] = this.translate("VAL_EXT-Detector_CustomModel")
      this.VALTranslate["EXT-GooglePhotos_Type"] = this.translate("VAL_EXT-GooglePhotos_Type")
      this.VALTranslate["EXT-GooglePhotos_Delay"] = this.translate("VAL_EXT-GooglePhotos_Delay")
      this.VALTranslate["EXT-GooglePhotos_Infos"] = this.translate("VAL_EXT-GooglePhotos_Infos")
      this.VALTranslate["EXT-GooglePhotos_Albums"] = this.translate("VAL_EXT-GooglePhotos_Albums")
      this.VALTranslate["EXT-GooglePhotos_Background"] = this.translate("VAL_EXT-GooglePhotos_Background")
      this.VALTranslate["EXT-GooglePhotos_Sort"] = this.translate("VAL_EXT-GooglePhotos_Sort")
      this.VALTranslate["EXT-GooglePhotos_HD"] = this.translate("VAL_EXT-GooglePhotos_HD")
      this.VALTranslate["EXT-GooglePhotos_Format"] = this.translate("VAL_EXT-GooglePhotos_Format")
      this.VALTranslate["EXT-GooglePhotos_Height"] = this.translate("VAL_EXT-GooglePhotos_Height")
      this.VALTranslate["EXT-GooglePhotos_Width"] = this.translate("VAL_EXT-GooglePhotos_Width")
      this.VALTranslate["EXT-GooglePhotos_uploadAlbum"] = this.translate("VAL_EXT-GooglePhotos_uploadAlbum")
      this.VALTranslate["EXT-Governor_Sleep"] = this.translate("VAL_EXT-Governor_Sleep")
      this.VALTranslate["EXT-Governor_Work"] = this.translate("VAL_EXT-Governor_Work")
      this.VALTranslate["EXT-Internet_Ping"] = this.translate("VAL_EXT-Internet_Ping")
      this.VALTranslate["EXT-Internet_Delay"] = this.translate("VAL_EXT-Internet_Delay")
      this.VALTranslate["EXT-Internet_Scan"] = this.translate("VAL_EXT-Internet_Scan")
      this.VALTranslate["EXT-Internet_Alert"] = this.translate("VAL_EXT-Internet_Alert")
      this.VALTranslate["EXT-Internet_Restart"] = this.translate("VAL_EXT-Internet_Restart")
      this.VALTranslate["EXT-Keyboard_keyFinder"] =  this.translate("VAL_EXT-Keyboard_keyFinder")
      this.VALTranslate["EXT-Keyboard_keys"] =  this.translate("VAL_EXT-Keyboard_keys")
      this.VALTranslate["EXT-Keyboard_keycode"] =  this.translate("VAL_EXT-Keyboard_keycode")
      this.VALTranslate["EXT-Keyboard_notification"] =  this.translate("VAL_EXT-Keyboard_notification")
      this.VALTranslate["EXT-Keyboard_payload"] =  this.translate("VAL_EXT-Keyboard_payload")
      this.VALTranslate["EXT-Keyboard_command"] =  this.translate("VAL_EXT-Keyboard_command")
      this.VALTranslate["EXT-Keyboard_sound"] =  this.translate("VAL_EXT-Keyboard_sound")
      this.VALTranslate["EXT-Librespot_Email"] = this.translate("VAL_EXT-Librespot_Email")
      this.VALTranslate["EXT-Librespot_Password"] = this.translate("VAL_EXT-Librespot_Password")
      this.VALTranslate["EXT-Librespot_Name"] = this.translate("VAL_EXT-Librespot_Name")
      this.VALTranslate["EXT-Librespot_Min"] = this.translate("VAL_EXT-Librespot_Min")
      this.VALTranslate["EXT-Librespot_Max"] = this.translate("VAL_EXT-Librespot_Max")
      this.VALTranslate["EXT-Motion_captureIntervalTime"] = this.translate("VAL_EXT-Motion_captureIntervalTime")
      this.VALTranslate["EXT-Motion_scoreThreshold"] = this.translate("VAL_EXT-Motion_scoreThreshold")
      this.VALTranslate["EXT-Motion_deviceId"] = this.translate("VAL_EXT-Motion_deviceId")
      this.VALTranslate["EXT-MusicPlayer_USB"] = this.translate("VAL_EXT-MusicPlayer_USB")
      this.VALTranslate["EXT-MusicPlayer_Path"] = this.translate("VAL_EXT-MusicPlayer_Path")
      this.VALTranslate["EXT-MusicPlayer_Check"] = this.translate("VAL_EXT-MusicPlayer_Check")
      this.VALTranslate["EXT-MusicPlayer_Start"] = this.translate("VAL_EXT-MusicPlayer_Start")
      this.VALTranslate["EXT-MusicPlayer_Min"] = this.translate("VAL_EXT-MusicPlayer_Min")
      this.VALTranslate["EXT-MusicPlayer_Max"] = this.translate("VAL_EXT-MusicPlayer_Max")
      this.VALTranslate["EXT-Pages_pages"] = this.translate("VAL_EXT-Pages_pages")
      this.VALTranslate["EXT-Pages_fixed"] = this.translate("VAL_EXT-Pages_fixed")
      this.VALTranslate["EXT-Pages_hiddenPages"] = this.translate("VAL_EXT-Pages_hiddenPages")
      this.VALTranslate["EXT-Pages_animateIn"] = this.translate("VAL_EXT-Pages_animateIn")
      this.VALTranslate["EXT-Pages_rotationTime"] = this.translate("VAL_EXT-Pages_rotationTime")
      this.VALTranslate["EXT-Pages_rotationTimes"] = this.translate("VAL_EXT-Pages_rotationTimes")
      this.VALTranslate["EXT-Pages_homePage"] = this.translate("VAL_EXT-Pages_homePage")
      this.VALTranslate["EXT-Pages_indicator"] = this.translate("VAL_EXT-Pages_indicator")
      this.VALTranslate["EXT-Pages_hideBeforeRotation"] = this.translate("VAL_EXT-Pages_hideBeforeRotation")
      this.VALTranslate["EXT-Pages_Gateway"] = this.translate("VAL_EXT-Pages_Gateway")
      this.VALTranslate["EXT-Pages_loading"] = this.translate("VAL_EXT-Pages_loading")
      this.VALTranslate["EXT-Photos_Delay"] = this.translate("VAL_EXT-Photos_Delay")
      this.VALTranslate["EXT-Photos_Loop"] = this.translate("VAL_EXT-Photos_Loop")
      this.VALTranslate["EXT-Pir_GPIO"] = this.translate("VAL_EXT-Pir_GPIO")
      this.VALTranslate["EXT-Pir_Reverse"] = this.translate("VAL_EXT-Pir_Reverse")
      this.VALTranslate["EXT-RadioPlayer_Min"] = this.translate("VAL_EXT-RadioPlayer_Min")
      this.VALTranslate["EXT-RadioPlayer_Max"] = this.translate("VAL_EXT-RadioPlayer_Max")
      this.VALTranslate["EXT-Selfies_captureWidth"] = this.translate("VAL_EXT-Selfies_captureWidth")
      this.VALTranslate["EXT-Selfies_captureHeight"] = this.translate("VAL_EXT-Selfies_captureHeight")
      this.VALTranslate["EXT-Selfies_device"] = this.translate("VAL_EXT-Selfies_device")
      this.VALTranslate["EXT-Selfies_usePreview"] = this.translate("VAL_EXT-Selfies_usePreview")
      this.VALTranslate["EXT-Selfies_previewWidth"] = this.translate("VAL_EXT-Selfies_previewWidth")
      this.VALTranslate["EXT-Selfies_previewHeight"] = this.translate("VAL_EXT-Selfies_previewHeight")
      this.VALTranslate["EXT-Selfies_displayButton"] = this.translate("VAL_EXT-Selfies_displayButton")
      this.VALTranslate["EXT-Selfies_buttonStyle"] = this.translate("VAL_EXT-Selfies_buttonStyle")
      this.VALTranslate["EXT-Selfies_buttons"] = this.translate("VAL_EXT-Selfies_buttons")
      this.VALTranslate["EXT-Selfies_blinkButton"] = this.translate("VAL_EXT-Selfies_blinkButton")
      this.VALTranslate["EXT-Selfies_playShutter"] = this.translate("VAL_EXT-Selfies_playShutter")
      this.VALTranslate["EXT-Selfies_resultDuration"] = this.translate("VAL_EXT-Selfies_resultDuration")
      this.VALTranslate["EXT-Selfies_autoValidate"] = this.translate("VAL_EXT-Selfies_autoValidate")
      this.VALTranslate["EXT-Selfies_counterStyle"] = this.translate("VAL_EXT-Selfies_counterStyle")
      this.VALTranslate["EXT-Selfies_showResult"] = this.translate("VAL_EXT-Selfies_showResult")
      this.VALTranslate["EXT-SelfiesFlash_gpio"] = this.translate("VAL_EXT-SelfiesFlash_gpio")
      this.VALTranslate["EXT-SelfiesSender_sendTelegramBotAuto"] = this.translate("VAL_EXT-SelfiesSender_sendTelegramBotAuto")
      this.VALTranslate["EXT-SelfiesSender_sendGooglePhotos"] = this.translate("VAL_EXT-SelfiesSender_sendGooglePhotos")
      this.VALTranslate["EXT-SelfiesSender_sendGooglePhotosAuto"] = this.translate("VAL_EXT-SelfiesSender_sendGooglePhotosAuto")
      this.VALTranslate["EXT-SelfiesSender_sendMail"] = this.translate("VAL_EXT-SelfiesSender_sendMail")
      this.VALTranslate["EXT-SelfiesSender_sendMailAuto"] = this.translate("VAL_EXT-SelfiesSender_sendMailAuto")
      this.VALTranslate["EXT-SelfiesSender_sendMailConfig"] = this.translate("VAL_EXT-SelfiesSender_sendMailConfig")
      this.VALTranslate["EXT-SelfiesSender_transport"] = this.translate("VAL_EXT-SelfiesSender_transport")
      this.VALTranslate["EXT-SelfiesSender_host"] = this.translate("VAL_EXT-SelfiesSender_host")
      this.VALTranslate["EXT-SelfiesSender_port"] = this.translate("VAL_EXT-SelfiesSender_port")
      this.VALTranslate["EXT-SelfiesSender_secure"] = this.translate("VAL_EXT-SelfiesSender_secure")
      this.VALTranslate["EXT-SelfiesSender_auth"] = this.translate("VAL_EXT-SelfiesSender_auth")
      this.VALTranslate["EXT-SelfiesSender_user"] = this.translate("VAL_EXT-SelfiesSender_user")
      this.VALTranslate["EXT-SelfiesSender_pass"] = this.translate("VAL_EXT-SelfiesSender_pass")
      this.VALTranslate["EXT-SelfiesSender_message"] = this.translate("VAL_EXT-SelfiesSender_message")
      this.VALTranslate["EXT-SelfiesSender_from"] = this.translate("VAL_EXT-SelfiesSender_from")
      this.VALTranslate["EXT-SelfiesSender_to"] = this.translate("VAL_EXT-SelfiesSender_to")
      this.VALTranslate["EXT-SelfiesSender_subject"] = this.translate("VAL_EXT-SelfiesSender_subject")
      this.VALTranslate["EXT-SelfiesSender_text"] = this.translate("VAL_EXT-SelfiesSender_text")
      this.VALTranslate["EXT-SelfiesViewer_moduleWidth"] = this.translate("VAL_EXT-SelfiesViewer_moduleWidth")
      this.VALTranslate["EXT-SelfiesViewer_moduleHeight"] = this.translate("VAL_EXT-SelfiesViewer_moduleHeight")
      this.VALTranslate["EXT-SelfiesViewer_displayDelay"] = this.translate("VAL_EXT-SelfiesViewer_displayDelay")
      this.VALTranslate["EXT-SelfiesViewer_displayBackground"] = this.translate("VAL_EXT-SelfiesViewer_displayBackground")
      this.VALTranslate["EXT-SelfiesViewer_sortBy"] = this.translate("VAL_EXT-SelfiesViewer_sortBy")
      this.VALTranslate["EXT-Screen_Body"] = this.translate("VAL_EXT-Screen_Body")
      this.VALTranslate["EXT-Screen_Dimmer"] = this.translate("VAL_EXT-Screen_Dimmer")
      this.VALTranslate["EXT-Screen_Delay"] = this.translate("VAL_EXT-Screen_Delay")
      this.VALTranslate["EXT-Screen_Mode"] = this.translate("VAL_EXT-Screen_Mode")
      this.VALTranslate["EXT-Screen_xrandrForceRotation"] = this.translate("VAL_EXT-Screen_xrandrForceRotation")
      this.VALTranslate["EXT-Screen_Counter"] = this.translate("VAL_EXT-Screen_Counter")
      this.VALTranslate["EXT-Screen_Bar"] = this.translate("VAL_EXT-Screen_Bar")
      this.VALTranslate["EXT-Screen_Style"] = this.translate("VAL_EXT-Screen_Style")
      this.VALTranslate["EXT-Screen_Presence"] = this.translate("VAL_EXT-Screen_Presence")
      this.VALTranslate["EXT-Screen_Date"] = this.translate("VAL_EXT-Screen_Date")
      this.VALTranslate["EXT-Screen_Availability"] = this.translate("VAL_EXT-Screen_Availability")
      this.VALTranslate["EXT-Screen_Sleeping"] = this.translate("VAL_EXT-Screen_Sleeping")
      this.VALTranslate["EXT-Screen_GPIO"] = this.translate("VAL_EXT-Screen_GPIO")
      this.VALTranslate["EXT-Screen_Reset"] = this.translate("VAL_EXT-Screen_Reset")
      this.VALTranslate["EXT-Screen_Sound"] = this.translate("VAL_EXT-Screen_Sound")
      this.VALTranslate["EXT-Screen_TouchMode"] = this.translate("VAL_EXT-Screen_TouchMode")
      this.VALTranslate["EXT-Screen_ON"] = this.translate("VAL_EXT-Screen_ON")
      this.VALTranslate["EXT-Screen_OFF"] = this.translate("VAL_EXT-Screen_OFF")
      this.VALTranslate["EXT-Screen_Days"] = this.translate("VAL_EXT-Screen_Days")
      this.VALTranslate["EXT-Screen_Hour"] = this.translate("VAL_EXT-Screen_Hour")
      this.VALTranslate["EXT-Screen_Minute"] = this.translate("VAL_EXT-Screen_Minute")
      this.VALTranslate["EXT-ScreenManager_Lock"] = this.translate("VAL_EXT-ScreenManager_Lock")
      this.VALTranslate["EXT-ScreenManager_On"] = this.translate("VAL_EXT-ScreenManager_On")
      this.VALTranslate["EXT-ScreenManager_Off"] = this.translate("VAL_EXT-ScreenManager_Off")
      this.VALTranslate["EXT-Spotify_Interval"] = this.translate("VAL_EXT-Spotify_Interval")
      this.VALTranslate["EXT-Spotify_Idle"] = this.translate("VAL_EXT-Spotify_Idle")
      this.VALTranslate["EXT-Spotify_BottomBar"] = this.translate("VAL_EXT-Spotify_BottomBar")
      this.VALTranslate["EXT-Spotify_ID"] = this.translate("VAL_EXT-Spotify_ID")
      this.VALTranslate["EXT-Spotify_Secret"] = this.translate("VAL_EXT-Spotify_Secret")
      this.VALTranslate["EXT-StreamDeck_device"] = this.translate("VAL_EXT-StreamDeck_device")
      this.VALTranslate["EXT-StreamDeck_brightness"] = this.translate("VAL_EXT-StreamDeck_brightness")
      this.VALTranslate["EXT-StreamDeck_ecobrightness"] = this.translate("VAL_EXT-StreamDeck_ecobrightness")
      this.VALTranslate["EXT-StreamDeck_ecotime"] = this.translate("VAL_EXT-StreamDeck_ecotime")
      this.VALTranslate["EXT-StreamDeck_logo"] = this.translate("VAL_EXT-StreamDeck_logo")
      this.VALTranslate["EXT-TelegramBot_telegramAPIKey"] = this.translate("VAL_EXT-TelegramBot_telegramAPIKey")
      this.VALTranslate["EXT-TelegramBot_adminChatId"] = this.translate("VAL_EXT-TelegramBot_adminChatId")
      this.VALTranslate["EXT-TelegramBot_allowedUser"] = this.translate("VAL_EXT-TelegramBot_allowedUser")
      this.VALTranslate["EXT-TelegramBot_commandAllowed"] = this.translate("VAL_EXT-TelegramBot_commandAllowed")
      this.VALTranslate["EXT-TelegramBot_useWelcomeMessage"] = this.translate("VAL_EXT-TelegramBot_useWelcomeMessage")
      this.VALTranslate["EXT-TelegramBot_useSoundNotification"] = this.translate("VAL_EXT-TelegramBot_useSoundNotification")
      this.VALTranslate["EXT-TelegramBot_TelegramBotServiceAlerte"] = this.translate("VAL_EXT-TelegramBot_TelegramBotServiceAlerte")
      this.VALTranslate["EXT-TelegramBot_favourites"] = this.translate("VAL_EXT-TelegramBot_favourites")
      this.VALTranslate["EXT-TelegramBot_telecast"] = this.translate("VAL_EXT-TelegramBot_telecast")
      this.VALTranslate["EXT-TelegramBot_telecastLife"] = this.translate("VAL_EXT-TelegramBot_telecastLife")
      this.VALTranslate["EXT-TelegramBot_telecastLimit"] = this.translate("VAL_EXT-TelegramBot_telecastLimit")
      this.VALTranslate["EXT-TelegramBot_telecastHideOverflow"] = this.translate("VAL_EXT-TelegramBot_telecastHideOverflow")
      this.VALTranslate["EXT-TelegramBot_telecastContainer"] = this.translate("VAL_EXT-TelegramBot_telecastContainer")
      this.VALTranslate["EXT-TelegramBot_dateFormat"] = this.translate("VAL_EXT-TelegramBot_dateFormat")
      this.VALTranslate["EXT-Updates_AutoUpdate"] = this.translate("VAL_EXT-Updates_AutoUpdate")
      this.VALTranslate["EXT-Updates_AutoRestart"] = this.translate("VAL_EXT-Updates_AutoRestart")
      this.VALTranslate["EXT-Updates_Log"] = this.translate("VAL_EXT-Updates_Log")
      this.VALTranslate["EXT-Updates_Timeout"] = this.translate("VAL_EXT-Updates_Timeout")
      this.VALTranslate["EXT-Volume_Start"] = this.translate("VAL_EXT-Volume_Start")
      this.VALTranslate["EXT-Volume_Sync"] = this.translate("VAL_EXT-Volume_Sync")
      this.VALTranslate["EXT-Welcome_Welcome"] = this.translate("VAL_EXT-Welcome_Welcome")
      this.VALTranslate["EXT-YouTube_Fullscreen"] = this.translate("VAL_EXT-YouTube_Fullscreen")
      this.VALTranslate["EXT-YouTube_Width"] = this.translate("VAL_EXT-YouTube_Width")
      this.VALTranslate["EXT-YouTube_Height"] = this.translate("VAL_EXT-YouTube_Height")
      this.VALTranslate["EXT-YouTube_Search"] = this.translate("VAL_EXT-YouTube_Search")
      this.VALTranslate["EXT-YouTube_Display"] = this.translate("VAL_EXT-YouTube_Display")
      this.VALTranslate["EXT-YouTube_Header"] = this.translate("VAL_EXT-YouTube_Header")
      this.VALTranslate["EXT-YouTube_Username"] = this.translate("VAL_EXT-YouTube_Username")
      this.VALTranslate["EXT-YouTube_Password"] = this.translate("VAL_EXT-YouTube_Password")
      this.VALTranslate["EXT-YouTubeCast_Name"] = this.translate("VAL_EXT-YouTubeCast_Name")
      this.VALTranslate["EXT-YouTubeCast_Port"] = this.translate("VAL_EXT-YouTubeCast_Port")
      resolve()
    })
  }

  Get_EXT_TrSchemaValidation() {
    return this.VALTranslate
  }

  /** Action on GA Status **/
  ActionsGA(status) {
    logGA("[EXTs] Received GA status:", status)
    if (!this.EXT.GA_Ready) return console.log("[GA] [EXTs] MMM-GoogleAssistant is not ready")
    switch(status) {
      case "LISTEN":
      case "THINK":
        if (this.EXT["EXT-Detector"].hello) this.sendNotification("EXT_DETECTOR-STOP")
        if (this.EXT["EXT-Screen"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) {
          if (!this.EXT["EXT-Screen"].power) this.sendNotification("EXT_SCREEN-WAKEUP")
          this.sendNotification("EXT_SCREEN-LOCK", { show: true } )
          if (this.EXT["EXT-Motion"].hello && this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-DESTROY")
          if (this.EXT["EXT-Pir"].hello && this.EXT["EXT-Pir"].started) this.sendNotification("EXT_PIR-STOP")
          if (this.EXT["EXT-StreamDeck"].hello) this.sendNotification("EXT_STREAMDECK-ON")
        }
        if (this.EXT["EXT-Pages"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) this.sendNotification("EXT_PAGES-PAUSE")
        if (this.EXT["EXT-Spotify"].hello && this.EXT["EXT-Spotify"].connected) this.sendNotification("EXT_SPOTIFY-VOLUME_MIN")
        if (this.EXT["EXT-RadioPlayer"].hello && this.EXT["EXT-RadioPlayer"].connected) this.sendNotification("EXT_RADIO-VOLUME_MIN")
        if (this.EXT["EXT-MusicPlayer"].hello && this.EXT["EXT-MusicPlayer"].connected) this.sendNotification("EXT_MUSIC-VOLUME_MIN")
        if (this.EXT["EXT-FreeboxTV"].hello && this.EXT["EXT-FreeboxTV"].connected) this.sendNotification("EXT_FREEBOXTV-VOLUME_MIN")
        if (this.EXT["EXT-YouTube"].hello && this.EXT["EXT-YouTube"].connected) this.sendNotification("EXT_YOUTUBE-VOLUME_MIN")
        break
      case "STANDBY":
        if (this.EXT["EXT-Detector"].hello) this.sendNotification("EXT_DETECTOR-START")
        if (this.EXT["EXT-Screen"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) {
          this.sendNotification("EXT_SCREEN-UNLOCK", { show: true } )
          if (this.EXT["EXT-Motion"].hello && !this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-INIT")
          if (this.EXT["EXT-Pir"].hello && !this.EXT["EXT-Pir"].started) this.sendNotification("EXT_PIR-START")
          if (this.EXT["EXT-StreamDeck"].hello) this.sendNotification("EXT_STREAMDECK-OFF")
        }
        if (this.EXT["EXT-Pages"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) this.sendNotification("EXT_PAGES-RESUME")
        if (this.EXT["EXT-Spotify"].hello && this.EXT["EXT-Spotify"].connected) this.sendNotification("EXT_SPOTIFY-VOLUME_MAX")
        if (this.EXT["EXT-RadioPlayer"].hello && this.EXT["EXT-RadioPlayer"].connected) this.sendNotification("EXT_RADIO-VOLUME_MAX")
        if (this.EXT["EXT-MusicPlayer"].hello && this.EXT["EXT-MusicPlayer"].connected) this.sendNotification("EXT_MUSIC-VOLUME_MAX")
        if (this.EXT["EXT-FreeboxTV"].hello && this.EXT["EXT-FreeboxTV"].connected) this.sendNotification("EXT_FREEBOXTV-VOLUME_MAX")
        if (this.EXT["EXT-YouTube"].hello && this.EXT["EXT-YouTube"].connected) this.sendNotification("EXT_YOUTUBE-VOLUME_MAX")
        break
      case "REPLY":
      case "CONTINUE":
      case "CONFIRMATION":
      case "ERROR":
      case "HOOK":
        break
    }
  }

  /** Activate automaticaly any plugins **/
  helloEXT(module) {
    switch (module) {
      case this.ExtDB.find(name => name === module): //read DB and find module
        this.EXT[module].hello= true
        this.sendSocketNotification("HELLO", module)
        logGA("[EXTs] Hello,", module)
        this.onStartPlugin(module)
        break
      default:
        break
    }
  }

  /** Rule when a plugin send Hello **/
  onStartPlugin(plugin) {
    if (!plugin) return
    if (plugin == "EXT-Background") this.sendNotification("GA_FORCE_FULLSCREEN")
    if (plugin == "EXT-Detector") setTimeout(() => this.sendNotification("EXT_DETECTOR-START") , 300)
    if (plugin == "EXT-Pages") this.sendNotification("EXT_PAGES-Gateway")
    if (plugin == "EXT-Pir") this.sendNotification("EXT_PIR-START")
    if (plugin == "EXT-Bring") this.sendNotification("EXT_BRING-START")
  }

  /** Connect rules **/
  connectEXT(extName) {
    if (!this.EXT.GA_Ready) return console.error("[GA] [EXTs] Hey " + extName + "!, MMM-GoogleAssistant is not ready")
    if (!this.EXT[extName] || this.EXT[extName].connected) return

    if(this.EXT["EXT-Screen"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) {
      if (!this.EXT["EXT-Screen"].power) this.sendNotification("EXT_SCREEN-WAKEUP")
      this.sendNotification("EXT_SCREEN-LOCK")
      if (this.EXT["EXT-Motion"].hello && this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-DESTROY")
      if (this.EXT["EXT-Pir"].hello && this.EXT["EXT-Pir"].started) this.sendNotification("EXT_PIR-STOP")
      if (this.EXT["EXT-StreamDeck"].hello) this.sendNotification("EXT_STREAMDECK-ON")
      if (this.EXT["EXT-Bring"].hello) this.sendNotification("EXT_BRING-STOP")
    }

    if (this.browserOrPhotoIsConnected()) {
      logGA("[EXTs] Connected:", extName, "[browserOrPhoto Mode]")
      this.EXT[extName].connected = true
      this.lockPagesByGW(extName)
      this.sendSocketNotification("EXTStatus", this.EXT)
      return
    }

    if (this.EXT["EXT-Spotify"].hello && this.EXT["EXT-Spotify"].connected) this.sendNotification("EXT_SPOTIFY-STOP")
    if (this.EXT["EXT-MusicPlayer"].hello && this.EXT["EXT-MusicPlayer"].connected) this.sendNotification("EXT_MUSIC-STOP")
    if (this.EXT["EXT-RadioPlayer"].hello && this.EXT["EXT-RadioPlayer"].connected) this.sendNotification("EXT_RADIO-STOP")
    if (this.EXT["EXT-YouTube"].hello && this.EXT["EXT-YouTube"].connected) this.sendNotification("EXT_YOUTUBE-STOP")
    if (this.EXT["EXT-YouTubeCast"].hello && this.EXT["EXT-YouTubeCast"].connected) this.sendNotification("EXT_YOUTUBECAST-STOP")
    if (this.EXT["EXT-FreeboxTV"].hello && this.EXT["EXT-FreeboxTV"].connected) this.sendNotification("EXT_FREEBOXTV-STOP")

    logGA("[EXTs] Connected:", extName)
    logGA("[EXTs] Debug:", this.EXT)
    this.EXT[extName].connected = true
    this.lockPagesByGW(extName)
  }

  /** disconnected rules **/
  disconnectEXT(extName) {
    if (!this.EXT.GA_Ready) return console.error("[GA] [EXTs] MMM-GoogleAssistant is not ready")
    if (!this.EXT[extName] || !this.EXT[extName].connected) return
    this.EXT[extName].connected = false

    // sport time ... verify if there is again an EXT module connected !
    setTimeout(()=> { // wait 1 sec before scan ...
      if (this.EXT["EXT-Screen"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) {
        this.sendNotification("EXT_SCREEN-UNLOCK")
        if (this.EXT["EXT-Motion"].hello && !this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-INIT")
        if (this.EXT["EXT-Pir"].hello && !this.EXT["EXT-Pir"].started) this.sendNotification("EXT_PIR-START")
        if (this.EXT["EXT-StreamDeck"].hello) this.sendNotification("EXT_STREAMDECK-OFF")
        if (this.EXT["EXT-Bring"].hello) this.sendNotification("EXT_BRING-START")
      }
      if (this.EXT["EXT-Pages"].hello && !this.hasPluginConnected(this.EXT, "connected", true)) this.sendNotification("EXT_PAGES-UNLOCK")
      logGA("[EXTs] Disconnected:", extName)
    }, 1000)
  }

  /** need to lock EXT-Pages ? **/
  lockPagesByGW(extName) {
    if (this.EXT["EXT-Pages"].hello) {
      if(this.EXT[extName].hello && this.EXT[extName].connected && typeof this.EXT["EXT-Pages"][extName] == "number") {
        this.sendNotification("EXT_PAGES-CHANGED", this.EXT["EXT-Pages"][extName])
        this.sendNotification("EXT_PAGES-LOCK")
      }
      else this.sendNotification("EXT_PAGES-PAUSE")
    }
  }

  /** need to force lock/unlock Pages and Screen ? **/
  forceLockPagesAndScreen() {
    if (this.EXT["EXT-Pages"].hello) this.sendNotification("EXT_PAGES-LOCK")
    if (this.EXT["EXT-Screen"].hello) {
      if (!this.EXT["EXT-Screen"].power) this.sendNotification("EXT_SCREEN-WAKEUP")
      this.sendNotification("EXT_SCREEN-LOCK")
    }
  }

  forceUnLockPagesAndScreen() {
    if (this.EXT["EXT-Pages"].hello) this.sendNotification("EXT_PAGES-UNLOCK")
    if (this.EXT["EXT-Screen"].hello) this.sendNotification("EXT_SCREEN-UNLOCK")
  }

  browserOrPhotoIsConnected() {
    if ((this.EXT["EXT-Browser"].hello && this.EXT["EXT-Browser"].connected) || 
      (this.EXT["EXT-Photos"].hello && this.EXT["EXT-Photos"].connected)) {
        logGA("[EXTs] browserOrPhoto", true)
        return true
    }
    return false
  }

  /** hasPluginConnected(obj, key, value)
   * obj: object to check
   * key: key to check in deep
   * value: value to check with associated key
   * @bugsounet 09/01/2022
  **/
  hasPluginConnected(obj, key, value) {
    if (typeof obj === 'object' && obj !== null) {
      if (obj.hasOwnProperty(key)) return true
      for (var p in obj) {
        if (obj.hasOwnProperty(p) && this.hasPluginConnected(obj[p], key, value)) {
          //logGA("check", key+":"+value, "in", p)
          if (obj[p][key] == value) {
            //logGA(p, "is connected")
            return true
          }
        }
      }
    }
    return false
  }

  checkModulesTB() {
    return new Promise(resolve => {
      var nb=0
      MM.getModules().withClass("EXT-Telegrambot MMM-TelegramBot").enumerate((module)=> {
        nb++
        if (nb >= 2) resolve(true)
      })
      resolve(false)
    })
  }

  checkModulePir() {
    return new Promise(resolve => {
      var nb=0
      MM.getModules().withClass("MMM-Pir").enumerate((module)=> {
        nb++
        if (nb >= 2) resolve(true)
      })
      resolve(false)
    })
  }

  /** Notification Actions **/
  ActionsEXTs(noti,payload,sender) {
    if (!this.EXT.GA_Ready) return console.log("[GA] [EXTs] MMM-GoogleAssistant is not ready")
    switch(noti) {
      case "EXT_HELLO":
        this.helloEXT(payload)
        break
      case "EXT_PAGES-Gateway":
        if (sender.name == "EXT-Pages") Object.assign(this.EXT["EXT-Pages"], payload)
        break
      case "EXT_GATEWAY":
        this.gatewayEXT(payload)
        break
      case "EXT_GATEWAY-Restart":
        this.sendSocketNotification("RESTART")
        break
      case "EXT_GATEWAY-Close":
        this.sendSocketNotification("CLOSE")
        break
      case "EXT_SCREEN-POWER":
        if (!this.EXT["EXT-Screen"].hello) return console.log("[GA] [EXTs] Warn Screen don't say to me HELLO!")
        this.EXT["EXT-Screen"].power = payload
        if (this.EXT["EXT-Pages"].hello) {
          if (this.EXT["EXT-Screen"].power) this.sendNotification("EXT_PAGES-RESUME")
          else this.sendNotification("EXT_PAGES-PAUSE")
        }
        break
      case "EXT_STOP":
        if (this.EXT["EXT-Alert"].hello && this.hasPluginConnected(this.EXT, "connected", true)) {
          this.sendNotification("EXT_ALERT", {
            type: "information",
            message: this.translate("EXTStop")
          })
        }
        break
      case "EXT_MUSIC-CONNECTED":
        if (!this.EXT["EXT-MusicPlayer"].hello) return console.log("[GA] [EXTs] Warn MusicPlayer don't say to me HELLO!")
        this.connectEXT("EXT-MusicPlayer")
        break
      case "EXT_MUSIC-DISCONNECTED":
        if (!this.EXT["EXT-MusicPlayer"].hello) return console.log("[GA] [EXTs] Warn MusicPlayer don't say to me HELLO!")
        this.disconnectEXT("EXT-MusicPlayer")
        break
      case "EXT_RADIO-CONNECTED":
        if (!this.EXT["EXT-RadioPlayer"].hello) return console.log("[GA] [EXTs] Warn RadioPlayer don't say to me HELLO!")
        this.connectEXT("EXT-RadioPlayer")
        break
      case "EXT_RADIO-DISCONNECTED":
        if (!this.EXT["EXT-RadioPlayer"].hello) return console.log("[GA] [EXTs] Warn RadioPlayer don't say to me HELLO!")
        this.disconnectEXT("EXT-RadioPlayer")
        break
      case "EXT_SPOTIFY-CONNECTED":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!")
        this.EXT["EXT-Spotify"].remote = true
        if (this.EXT["EXT-SpotifyCanvasLyrics"].hello && this.EXT["EXT-SpotifyCanvasLyrics"].forced) this.connectEXT("EXT-SpotifyCanvasLyrics")
        break
      case "EXT_SPOTIFY-DISCONNECTED":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!")
        this.EXT["EXT-Spotify"].remote = false
        if (this.EXT["EXT-SpotifyCanvasLyrics"].hello && this.EXT["EXT-SpotifyCanvasLyrics"].forced) this.disconnectEXT("EXT-SpotifyCanvasLyrics")
        break
      case "EXT_SPOTIFY-PLAYING":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!")
        this.EXT["EXT-Spotify"].play = payload
        break
      case "EXT_SPOTIFY-PLAYER_CONNECTED":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!")
        this.connectEXT("EXT-Spotify")
        break
      case "EXT_SPOTIFY-PLAYER_DISCONNECTED":
        if (!this.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXTs Warn Spotify don't say to me HELLO!")
        this.disconnectEXT("EXT-Spotify")
        break
      case "EXT_YOUTUBE-CONNECTED":
        if (!this.EXT["EXT-YouTube"].hello) return console.error("[GA] [EXTs] Warn YouTube don't say to me HELLO!")
        this.connectEXT("EXT-YouTube")
        break
      case "EXT_YOUTUBE-DISCONNECTED":
        if (!this.EXT["EXT-YouTube"].hello) return console.error("[GA] [EXTs] Warn YouTube don't say to me HELLO!")
        this.disconnectEXT("EXT-YouTube")
        break
      case "EXT_YOUTUBECAST-CONNECTED":
        if (!this.EXT["EXT-YouTubeCast"].hello) return console.error("[GA] [EXTs] Warn YouTubeCast don't say to me HELLO!")
        this.connectEXT("EXT-YouTubeCast")
        break
      case "EXT_YOUTUBECAST-DISCONNECTED":
        if (!this.EXT["EXT-YouTubeCast"].hello) return console.error("[GA] [EXTs] Warn YouTubeCast don't say to me HELLO!")
        this.disconnectEXT("EXT-YouTubeCast")
        break
      case "EXT_BROWSER-CONNECTED":
        if (!this.EXT["EXT-Browser"].hello) return console.error("[GA] [EXTs] Warn Browser don't say to me HELLO!")
        this.connectEXT("EXT-Browser")
        break
      case "EXT_BROWSER-DISCONNECTED":
        if (!this.EXT["EXT-Browser"].hello) return console.error("[GA] [EXTs] Warn Browser don't say to me HELLO!")
        this.disconnectEXT("EXT-Browser")
        break
      case "EXT_FREEBOXTV-CONNECTED":
        if (!this.EXT["EXT-FreeboxTV"].hello) return console.error("[GA] [EXTs] Warn FreeboxTV don't say to me HELLO!")
        this.connectEXT("EXT-FreeboxTV")
        break
      case "EXT_FREEBOXTV-DISCONNECTED":
        if (!this.EXT["EXT-FreeboxTV"].hello) return console.error("[GA] [EXTs] Warn FreeboxTV don't say to me HELLO!")
        this.disconnectEXT("EXT-FreeboxTV")
        break
      case "EXT_PHOTOS-CONNECTED":
        if (!this.EXT["EXT-Photos"].hello) return console.error("[GA] [EXTs] Warn Photos don't say to me HELLO!")
        this.connectEXT("EXT-Photos")
        break
      case "EXT_PHOTOS-DISCONNECTED":
        if (!this.EXT["EXT-Photos"].hello) return console.error("[GA] [EXTs] Warn Photos don't say to me HELLO!")
        this.disconnectEXT("EXT-Photos")
        break
      case "EXT_INTERNET-DOWN":
        if (!this.EXT["EXT-Internet"].hello) return console.error("[GA] [EXTs] Warn Internet don't say to me HELLO!")
        if (this.EXT["EXT-Detector"].hello) this.sendNotification("EXT_DETECTOR-STOP")
        if (this.EXT["EXT-Spotify"].hello) this.sendNotification("EXT_SPOTIFY-MAIN_STOP")
        if (this.EXT["EXT-GooglePhotos"].hello) this.sendNotification("EXT_GOOGLEPHOTOS-STOP")
        break
      case "EXT_INTERNET-UP":
        if (!this.EXT["EXT-Internet"].hello) return console.error("[GA] [EXTs] Warn Internet don't say to me HELLO!")
        if (this.EXT["EXT-Detector"].hello) this.sendNotification("EXT_DETECTOR-START")
        if (this.EXT["EXT-Spotify"].hello) this.sendNotification("EXT_SPOTIFY-MAIN_START")
        if (this.EXT["EXT-GooglePhotos"].hello) this.sendNotification("EXT_GOOGLEPHOTOS-START")
        break
      case "EXT_UPDATES-MODULE_UPDATE":
        if (!this.EXT || !this.EXT["EXT-Updates"].hello) return console.error("[GA] [EXTs] Warn UN don't say to me HELLO!")
        this.EXT["EXT-Updates"].module = payload
        break
      case "EXT_VOLUME_GET":
        if (!this.EXT["EXT-Volume"].hello) return console.error("[GA] [EXTs] Warn Volume don't say to me HELLO!")
        this.EXT["EXT-Volume"].speaker = payload.Speaker
        this.EXT["EXT-Volume"].isMuted = payload.SpeakerIsMuted
        this.EXT["EXT-Volume"].recorder = payload.Recorder
        break
      case "EXT_SPOTIFY-SCL_FORCED":
        if (!this.EXT["EXT-SpotifyCanvasLyrics"].hello) return console.error("[GA] [EXTs] Warn Spotify don't say to me HELLO!")
        this.EXT["EXT-SpotifyCanvasLyrics"].forced = payload
        if (this.EXT["EXT-SpotifyCanvasLyrics"].forced && this.EXT["EXT-Spotify"].remote && this.EXT["EXT-Spotify"].play) this.connectEXT("EXT-SpotifyCanvasLyrics")
        if (!this.EXT["EXT-SpotifyCanvasLyrics"].forced && this.EXT["EXT-SpotifyCanvasLyrics"].connected) this.disconnectEXT("EXT-SpotifyCanvasLyrics")
        break
      case "EXT_MOTION-STARTED":
        if (!this.EXT["EXT-Motion"].hello) return console.error("[GA] [EXTs] Warn Motion don't say to me HELLO!")
        this.EXT["EXT-Motion"].started = true
        break
      case "EXT_MOTION-STOPPED":
        if (!this.EXT["EXT-Motion"].hello) return console.error("[GA] [EXTs] Warn Motion don't say to me HELLO!")
        this.EXT["EXT-Motion"].started = false
        break
      case "EXT_PIR-STARTED":
        if (!this.EXT["EXT-Pir"].hello) return console.error("[GA] [EXTs] Warn Pir don't say to me HELLO!")
        this.EXT["EXT-Pir"].started = true
        break
      case "EXT_PIR-STOPPED":
        if (!this.EXT["EXT-Pir"].hello) return console.error("[GA] [EXTs] Warn Pir don't say to me HELLO!")
        this.EXT["EXT-Pir"].started = false
        break
      case "EXT_SELFIES-START":
        if (!this.EXT["EXT-Selfies"].hello) return console.error("[GA] [EXTs] Warn Selfies don't say to me HELLO!")
        this.connectEXT("EXT-Selfies")
        if (this.EXT["EXT-Motion"].hello && this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-DESTROY")
        break
      case "EXT_SELFIES-END":
        if (!this.EXT["EXT-Selfies"].hello) return console.error("[GA] [EXTs Warn Selfies don't say to me HELLO!")
        this.disconnectEXT("EXT-Selfies")
        if (this.EXT["EXT-Motion"].hello && !this.EXT["EXT-Motion"].started) this.sendNotification("EXT_MOTION-INIT")
        break
      case "EXT_PAGES-NUMBER_IS":
        if (!this.EXT["EXT-Pages"].hello) return console.error("[GA] [EXTs] Warn Pages don't say to me HELLO!")
        this.EXT["EXT-Pages"].actual = payload.Actual
        this.EXT["EXT-Pages"].total = payload.Total
        break
      /** Warn if not in db **/
      default:
        logGA("[EXTs] Sorry, i don't understand what is", noti, payload || "")
        break
    }
    this.sendSocketNotification("EXTStatus", this.EXT)
    logGA("[EXTs] Status:", this.EXT)
  }

  /**********************/
  /** Scan GA Response **/
  /**********************/
  gatewayEXT(response) {
    if (!response) return // @todo scan if type array ??
    logGA("[EXTs] Response Scan")
    let tmp = {
      photos: {
        urls: response.photos && response.photos.length ? response.photos : [],
        length: response.photos && response.photos.length ? response.photos.length : 0
      },
      links: {
        urls: response.urls && response.urls.length ?  response.urls : [],
        length: response.urls && response.urls.length ? response.urls.length : 0
      },
      youtube: response.youtube
    }

    // the show must go on !
    var urls = configMerge({}, urls, tmp)
    if(urls.photos.length > 0 && this.EXT["EXT-Photos"].hello) {
      this.EXT["EXT-Photos"].connected = true
      this.sendNotification("EXT_PHOTOS-OPEN", urls.photos.urls)
      logGA("[EXTs] Forced connected: EXT-Photos")
    }
    else if (urls.links.length > 0) {
      this.urlsScan(urls)
    } else if (urls.youtube && this.EXT["EXT-YouTube"].hello) {
      this.sendNotification("EXT_YOUTUBE-SEARCH", urls.youtube)
      logGA("[EXTs] Sended to YT", urls.youtube)
    }
    logGA("[EXTs] Response Structure:", urls)
  }

  /** urls scan : dispatch url, youtube, spotify **/
  /** use the FIRST discover link only **/
  urlsScan(urls) {
    var firstURL = urls.links.urls[0]

    /** YouTube RegExp **/
    var YouTubeLink = new RegExp("youtube\.com\/([a-z]+)\\?([a-z]+)\=([0-9a-zA-Z\-\_]+)", "ig")
    /** Scan Youtube Link **/
    var YouTube = YouTubeLink.exec(firstURL)

    if (YouTube) {
      let Type
      if (YouTube[1] == "watch") Type = "id"
      if (YouTube[1] == "playlist") Type = "playlist"
      if (!Type) return console.log("[EXT_NotificationsActions] [GA:EXT:YouTube] Unknow Type !" , YouTube)
      if (this.EXT["EXT-YouTube"].hello) {
        if (Type == "playlist") {
          this.sendNotification("EXT_ALERT",{
            message: "EXT_YOUTUBE don't support playlist",
            timer: 5000,
            type: "warning"
          })
          return
        }
        this.sendNotification("EXT_YOUTUBE-PLAY", YouTube[3])
      }
      return
    }

    /** scan spotify links **/
    /** Spotify RegExp **/
    var SpotifyLink = new RegExp("open\.spotify\.com\/([a-z]+)\/([0-9a-zA-Z\-\_]+)", "ig")
    var Spotify = SpotifyLink.exec(firstURL)
    if (Spotify) {
      let type = Spotify[1]
      let id = Spotify[2]
      if (this.EXT["EXT-Spotify"].hello) {
        if (type == "track") {
          // don't know why tracks works only with uris !?
          this.sendNotification("EXT_SPOTIFY-PLAY", {"uris": ["spotify:track:" + id ]})
        }
        else {
          this.sendNotification("EXT_SPOTIFY-PLAY", {"context_uri": "spotify:"+ type + ":" + id})
        }
      }
      return
    }
    // send to Browser
    if (this.EXT["EXT-Browser"].hello) {
      // force connexion for rules (don't turn off other EXT)
      this.EXT["EXT-Browser"].connected = true
      this.sendNotification("EXT_BROWSER-OPEN", firstURL)
      logGA("[EXTs] Forced connected: EXT-Browser")
    }
  }

  /** callbacks **/
  callbacks(noti,payload) {
    switch(noti) {
      case "CB_SCREEN":
        if (payload == "ON") this.sendNotification("EXT_SCREEN-FORCE_WAKEUP")
        else if (payload == "OFF") {
          this.sendNotification("EXT_STOP")
          this.sendNotification("EXT_SCREEN-FORCE_END")
        }
        break
      case "CB_VOLUME":
        this.sendNotification("EXT_VOLUME-SPEAKER_SET", payload)
        break
      case "CB_VOLUME-MUTE":
        this.sendNotification("EXT_VOLUME-SPEAKER_MUTE", payload)
        break
      case "CB_VOLUME-UP":
        this.sendNotification("EXT_VOLUME-SPEAKER_UP", payload)
        break
      case "CB_VOLUME-DOWN":
        this.sendNotification("EXT_VOLUME-SPEAKER_DOWN", payload)
        break
      case "CB_SET-PAGE":
        this.sendNotification("EXT_PAGES-CHANGED", payload)
        break
      case "CB_SET-NEXT-PAGE":
        this.sendNotification("EXT_PAGES-INCREMENT")
        break
      case "CB_SET-PREVIOUS-PAGE":
        this.sendNotification("EXT_PAGES-DECREMENT")
        break
      case "CB_ALERT":
        this.sendNotification("EXT_ALERT", {
          message: payload,
          type: "warning",
          timer: 10000
        })
        break
      case "CB_DONE":
        this.sendNotification("EXT_ALERT", {
          message: payload,
          type: "information",
          timer: 5000
        })
        break
      case "CB_LOCATE":
        this.sendNotification("EXT_ALERT", {
          message: "Hey, I'm here !",
          type: "information",
          sound: "modules/MMM-GoogleAssistant/website/tools/locator.mp3",
          timer: 19000
        })
        break
      case "CB_SPOTIFY-PLAY":
        this.sendNotification("EXT_SPOTIFY-PLAY")
        break
      case "CB_SPOTIFY-PAUSE":
        this.sendNotification("EXT_SPOTIFY-PAUSE")
        break
      case "CB_SPOTIFY-PREVIOUS":
        this.sendNotification("EXT_SPOTIFY-PREVIOUS")
        break
      case "CB_SPOTIFY-NEXT":
        this.sendNotification("EXT_SPOTIFY-NEXT")
        break
      case "CB_STOP":
        this.notificationReceived("EXT_STOP")
        this.sendNotification("EXT_STOP")
        break
      case "CB_TV-PLAY":
        this.sendNotification("EXT_FREEBOXTV-PLAY")
        break
      case "CB_TV-NEXT":
        this.sendNotification("EXT_FREEBOXTV-NEXT")
        break
      case "CB_TV-PREVIOUS":
        this.sendNotification("EXT_FREEBOXTV-PREVIOUS")
        break
      case "CB_SPOTIFY-LYRICS-ON":
        this.sendNotification("EXT_SPOTIFY-SCL", true)
        break
      case "CB_SPOTIFY-LYRICS-OFF":
        this.sendNotification("EXT_SPOTIFY-SCL", false)
        break
    }
  }
}
