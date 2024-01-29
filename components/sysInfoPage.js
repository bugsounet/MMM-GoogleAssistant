class sysInfoPage {
  constructor(Tools) {
    this.translate = (...args) => Tools.translate(...args)
    this.sendSocketNotification = (...args) => Tools.sendSocketNotification(...args)
    this.lock = () => Tools.lock()
    this.unLock = () => Tools.unLock()

    this.init = false
    this.showing = false
    this.timerRefresh = null
    this.timerHide = null
    this.System = {
      VERSION:{
        GA:"unknow",
        MagicMirror:"unknow",
        ELECTRON:"unknow",
        NODEMM:"unknow",
        NODECORE:"unknow",
        NPM:"unknow",
        KERNEL:"unknow",
        OS:"unknow"
      },
      HOSTNAME:"unknow",
      NETWORK:{
        type: "unknow",
        ip: "unknow",
        name: "unknow",
        speed: null,
        duplex: '',
        ssid: "unknow",
        frequency: undefined,
        signalLevel: -99,
        barLevel: 0,
        interface: "unknow",
        rate: undefined,
        quality: undefined
      },
      MEMORY:{
        total:0,
        used:0,
        percent:0,
        swapTotal:0,
        swapUsed:0,
        swapPercent:0
      },
      STORAGE:[],
      CPU:{
        usage:0,
        type:"unknow",
        temp:{
          C:0,
          F:0
        },
        speed:"unknow",
        governor:"unknow"
      },
      GPU: "unknow",
      UPTIME:{
        current:0,
        currentDHM:"unknow",
        recordCurrent:0,
        recordCurrentDHM:"unknow",
        MM:0,
        MMDHM:"unknow",
        recordMM:0,
        recordMMDHM:"unknow"
      },
      PROCESS:{
        nginx:{
          pid:0,
          cpu:0,
          mem:0
        },
        electron:{
          pid:0,
          cpu:0,
          mem:0
        },
        librespot:{
          pid:0,
          cpu:0,
          mem:0
        },
        pm2:{
          pid:0,
          cpu:0,
          mem:0
        }
      }
    }
    console.log("[GA] SysInfo Loaded !")
  }

  prepare() {
    var wrapper = document.createElement("div")
    wrapper.id= "GA_SYSINFO"
    wrapper.classList.add("hidden")

      var content_wrapper = document.createElement("div")
      content_wrapper.id = "GA-CONTENT_WRAPPER"
      wrapper.appendChild(content_wrapper)

        var Hostname_container = document.createElement("div")
        Hostname_container.id = "GA-HOSTNAME_CONTAINER"
        content_wrapper.appendChild(Hostname_container)

          var Hostname_value = document.createElement("div")
          Hostname_value.id = "GA-HOSTNAME_VALUE"
          Hostname_value.textContent = this.translate("LOADING")
          Hostname_container.appendChild(Hostname_value)

        var GPU_container = document.createElement("div")
        GPU_container.id = "GA-GPU_CONTAINER"
        content_wrapper.appendChild(GPU_container)

          var GPU_value = document.createElement("div")
          GPU_value.id = "GA-GPU_VALUE"
          GPU_value.textContent = "GPU..."
          GPU_container.appendChild(GPU_value)

        var Sysinfo_container = document.createElement("div")
        Sysinfo_container.id = "GA-SYSINFO_CONTAINER"
        content_wrapper.appendChild(Sysinfo_container)

          var Sysinfo_container_row = document.createElement("div")
          Sysinfo_container_row.id = "GA-SYSINFO_CONTAINER_ROW"
          Sysinfo_container.appendChild(Sysinfo_container_row)

            /** Versions **/
            var Sysinfo_version = document.createElement("div")
            Sysinfo_version.id = "GA-SYSINFO_VERSION"
            Sysinfo_container_row.appendChild(Sysinfo_version)

              var Sysinfo_version_group = document.createElement("div")
              Sysinfo_version_group.id = "GA-SYSINFO_VERSION_GROUP"
              Sysinfo_version.appendChild(Sysinfo_version_group)

                var Sysinfo_version_heading = document.createElement("div")
                Sysinfo_version_heading.id = "GA-SYSINFO_VERSION_HEADING"
                Sysinfo_version_group.appendChild(Sysinfo_version_heading)

                  var Sysinfo_version_heading_value = document.createElement("div")
                  Sysinfo_version_heading_value.id = "GA-SYSINFO_VERSION_HEADING_VALUE"
                  Sysinfo_version_heading_value.textContent = this.translate("GW_System_Box_Version")
                  Sysinfo_version_heading.appendChild(Sysinfo_version_heading_value)

                var Sysinfo_version_list = document.createElement("div")
                Sysinfo_version_list.id = "GA-SYSINFO_VERSION_LIST"
                Sysinfo_version_group.appendChild(Sysinfo_version_list)

              var GAVersion = document.createElement("div")
              GAVersion.id = "GA-SYSINFO_VERSION-GA"
              GAVersion.textContent = "MMM-GoogleAssistant:"
              Sysinfo_version_list.appendChild(GAVersion)
                var GAVersion_Value = document.createElement("div")
                GAVersion_Value.id = "GA-SYSINFO_VERSION-GA-VALUE"
                GAVersion_Value.textContent= this.System.VERSION.GA
                GAVersion.appendChild(GAVersion_Value)

              var MM = document.createElement("div")
              MM.id = "GA-SYSINFO_VERSION-MM"
              MM.textContent = "MagicMirror²:"
              Sysinfo_version_list.appendChild(MM)
                var MM_Value = document.createElement("div")
                MM_Value.id = "GA-SYSINFO_VERSION-MM-VALUE"
                MM_Value.textContent= this.System.VERSION.MagicMirror
                MM.appendChild(MM_Value)

              var ELECTRON = document.createElement("div")
              ELECTRON.id = "GA-SYSINFO_VERSION-ELECTRON"
              ELECTRON.textContent = "Electron:"
              Sysinfo_version_list.appendChild(ELECTRON)
                var ELECTRON_Value = document.createElement("div")
                ELECTRON_Value.id = "GA-SYSINFO_VERSION-ELECTRON-VALUE"
                ELECTRON_Value.textContent= this.System.VERSION.ELECTRON
                ELECTRON.appendChild(ELECTRON_Value)

              var MMNode = document.createElement("div")
              MMNode.id = "GA-SYSINFO_VERSION-MMNODE"
              MMNode.textContent = "MagicMirrror² Node:"
              Sysinfo_version_list.appendChild(MMNode)
                var MMNode_Value = document.createElement("div")
                MMNode_Value.id = "GA-SYSINFO_VERSION-MMNODE-VALUE"
                MMNode_Value.textContent= this.System.VERSION.NODEMM
                MMNode.appendChild(MMNode_Value)

              var Node = document.createElement("div")
              Node.id = "GA-SYSINFO_VERSION-NODE"
              Node.textContent = this.translate("GW_System_NodeVersion")
              Sysinfo_version_list.appendChild(Node)
                var Node_Value = document.createElement("div")
                Node_Value.id = "GA-SYSINFO_VERSION-NODE-VALUE"
                Node_Value.textContent= this.System.VERSION.NODECORE
                Node.appendChild(Node_Value)

              var NPM = document.createElement("div")
              NPM.id = "GA-SYSINFO_VERSION-NPM"
              NPM.textContent = this.translate("GW_System_NPMVersion")
              Sysinfo_version_list.appendChild(NPM)
                var NPM_Value = document.createElement("div")
                NPM_Value.id = "GA-SYSINFO_VERSION-NPM-VALUE"
                NPM_Value.textContent= this.System.VERSION.NPM
                NPM.appendChild(NPM_Value)

              var OS = document.createElement("div")
              OS.id = "GA-SYSINFO_VERSION-OS"
              OS.textContent = this.translate("GW_System_OSVersion")
              Sysinfo_version_list.appendChild(OS)
                var OS_Value = document.createElement("div")
                OS_Value.id = "GA-SYSINFO_VERSION-OS-VALUE"
                OS_Value.textContent= this.System.VERSION.OS
                OS.appendChild(OS_Value)

              var Kernel = document.createElement("div")
              Kernel.id = "GA-SYSINFO_VERSION-KERNEL"
              Kernel.textContent = this.translate("GW_System_KernelVersion")
              Sysinfo_version_list.appendChild(Kernel)
                var Kernel_Value = document.createElement("div")
                Kernel_Value.id = "GA-SYSINFO_VERSION-KERNEL-VALUE"
                Kernel_Value.textContent= this.System.VERSION.KERNEL
                Kernel.appendChild(Kernel_Value)

            /** CPU **/
            var Sysinfo_cpu = document.createElement("div")
            Sysinfo_cpu.id = "GA-SYSINFO_CPU"
            Sysinfo_container_row.appendChild(Sysinfo_cpu)

              var Sysinfo_cpu_group = document.createElement("div")
              Sysinfo_cpu_group.id = "GA-SYSINFO_CPU_GROUP"
              Sysinfo_cpu.appendChild(Sysinfo_cpu_group)

                var Sysinfo_cpu_heading = document.createElement("div")
                Sysinfo_cpu_heading.id = "GA-SYSINFO_CPU_HEADING"
                Sysinfo_cpu_group.appendChild(Sysinfo_cpu_heading)

                  var Sysinfo_cpu_heading_value = document.createElement("div")
                  Sysinfo_cpu_heading_value.id = "GA-SYSINFO_CPU_HEADING_VALUE"
                  Sysinfo_cpu_heading_value.textContent = this.translate("GW_System_CPUSystem")
                  Sysinfo_cpu_heading.appendChild(Sysinfo_cpu_heading_value)

                var Sysinfo_cpu_list = document.createElement("div")
                Sysinfo_cpu_list.id = "GA-SYSINFO_CPU_LIST"
                Sysinfo_cpu_group.appendChild(Sysinfo_cpu_list)

              var Type = document.createElement("div")
              Type.id = "GA-SYSINFO_CPU-TYPE"
              Type.textContent = this.translate("GW_System_TypeCPU")
              Sysinfo_cpu_list.appendChild(Type)
                var Type_Value = document.createElement("div")
                Type_Value.id = "GA-SYSINFO_CPU-TYPE-VALUE"
                Type_Value.textContent= this.System.CPU.type
                Type.appendChild(Type_Value)

              var Speed = document.createElement("div")
              Speed.id = "GA-SYSINFO_CPU-SPEED"
              Speed.textContent = this.translate("GW_System_SpeedCPU")
              Sysinfo_cpu_list.appendChild(Speed)
                var Speed_Value = document.createElement("div")
                Speed_Value.id = "GA-SYSINFO_CPU-SPEED-VALUE"
                Speed_Value.textContent= this.System.CPU.speed
                Speed.appendChild(Speed_Value)

              var Usage = document.createElement("div")
              Usage.id = "GA-SYSINFO_CPU-USAGE"
              Usage.textContent = this.translate("GW_System_CurrentLoadCPU")
              Sysinfo_cpu_list.appendChild(Usage)
                var Usage_Progress = document.createElement("div")
                Usage_Progress.id = "GA-SYSINFO_CPU-USAGE-PROGRESS"
                Usage_Progress.className = "SysInfo-progress"
                Usage.appendChild(Usage_Progress)
                  var Usage_ProgressBar = document.createElement("div")
                  Usage_ProgressBar.id = "GA-SYSINFO_CPU-USAGE-PROGRESSBAR"
                  Usage_ProgressBar.className = "SysInfo-progress-bar"
                  Usage_Progress.appendChild(Usage_ProgressBar)
              var Governor = document.createElement("div")
              Governor.id = "GA-SYSINFO_CPU-GOVERNOR"
              Governor.textContent = this.translate("GW_System_GovernorCPU")
              Sysinfo_cpu_list.appendChild(Governor)
                var Governor_Value = document.createElement("div")
                Governor_Value.id = "GA-SYSINFO_CPU-GOVERNOR-VALUE"
                Governor_Value.textContent= this.System.CPU.governor
                Governor.appendChild(Governor_Value)

              var Temp = document.createElement("div")
              Temp.id = "GA-SYSINFO_CPU-TEMP"
              Temp.textContent = this.translate("GW_System_TempCPU")
              Sysinfo_cpu_list.appendChild(Temp)
                var Temp_Progress = document.createElement("div")
                Temp_Progress.id = "GA-SYSINFO_CPU-TEMP-PROGRESS"
                Temp_Progress.className = "SysInfo-progress"
                Temp.appendChild(Temp_Progress)
                  var Temp_ProgressBar = document.createElement("div")
                  Temp_ProgressBar.id = "GA-SYSINFO_CPU-TEMP-PROGRESSBAR"
                  Temp_ProgressBar.className = "SysInfo-progress-bar"
                  Temp_Progress.appendChild(Temp_ProgressBar)
            /** Memory **/
            var Sysinfo_memory = document.createElement("div")
            Sysinfo_memory.id = "GA-SYSINFO_MEMORY"
            Sysinfo_container_row.appendChild(Sysinfo_memory)

              var Sysinfo_memory_group = document.createElement("div")
              Sysinfo_memory_group.id = "GA-SYSINFO_MEMORY_GROUP"
              Sysinfo_memory.appendChild(Sysinfo_memory_group)

                var Sysinfo_memory_heading = document.createElement("div")
                Sysinfo_memory_heading.id = "GA-SYSINFO_MEMORY_HEADING"
                Sysinfo_memory_group.appendChild(Sysinfo_memory_heading)

                  var Sysinfo_memory_heading_value = document.createElement("div")
                  Sysinfo_memory_heading_value.id = "GA-SYSINFO_MEMORY_HEADING_VALUE"
                  Sysinfo_memory_heading_value.textContent = this.translate("GW_System_MemorySystem")
                  Sysinfo_memory_heading.appendChild(Sysinfo_memory_heading_value)

                var Sysinfo_memory_list = document.createElement("div")
                Sysinfo_memory_list.id = "GA-SYSINFO_MEMORY_LIST"
                Sysinfo_memory_group.appendChild(Sysinfo_memory_list)

              var Active = document.createElement("div")
              Active.id = "GA-SYSINFO_MEMORY-ACTIVE"
              Active.textContent = this.translate("GW_System_TypeMemory")
              Sysinfo_memory_list.appendChild(Active)

                var Active_Progress = document.createElement("div")
                Active_Progress.id = "GA-SYSINFO_MEMORY-ACTIVE-PROGRESS"
                Active_Progress.className = "SysInfo-progress"
                Active.appendChild(Active_Progress)
                  var Active_ProgressBar = document.createElement("div")
                  Active_ProgressBar.id = "GA-SYSINFO_MEMORY-ACTIVE-PROGRESSBAR"
                  Active_ProgressBar.className = "SysInfo-progress-bar"
                  Active_Progress.appendChild(Active_ProgressBar)

                var Active_ValueTotal = document.createElement("div")
                Active_ValueTotal.id = "GA-SYSINFO_MEMORY-ACTIVE-VALUE-TOTAL"
                Active_ValueTotal.textContent= this.System.MEMORY.total
                Active.appendChild(Active_ValueTotal)

              var Swap = document.createElement("div")
              Swap.id = "GA-SYSINFO_MEMORY-SWAP"
              Swap.textContent = this.translate("GW_System_SwapMemory")
              Sysinfo_memory_list.appendChild(Swap)
              
                var Swap_Progress = document.createElement("div")
                Swap_Progress.id = "GA-SYSINFO_MEMORY-SWAP-PROGRESS"
                Swap_Progress.className = "SysInfo-progress"
                Swap.appendChild(Swap_Progress)
                  var Swap_ProgressBar = document.createElement("div")
                  Swap_ProgressBar.id = "GA-SYSINFO_MEMORY-SWAP-PROGRESSBAR"
                  Swap_ProgressBar.className = "SysInfo-progress-bar"
                  Swap_Progress.appendChild(Swap_ProgressBar)

                var Swap_ValueTotal = document.createElement("div")
                Swap_ValueTotal.id = "GA-SYSINFO_MEMORY-SWAP-VALUE-TOTAL"
                Swap_ValueTotal.textContent= this.System.MEMORY.swapTotal
                Swap.appendChild(Swap_ValueTotal)

            /** storage **/
            var Sysinfo_storage = document.createElement("div")
            Sysinfo_storage.id = "GA-SYSINFO_STORAGE"
            Sysinfo_container_row.appendChild(Sysinfo_storage)

              var Sysinfo_storage_group = document.createElement("div")
              Sysinfo_storage_group.id = "GA-SYSINFO_STORAGE_GROUP"
              Sysinfo_storage.appendChild(Sysinfo_storage_group)

                var Sysinfo_storage_heading = document.createElement("div")
                Sysinfo_storage_heading.id = "GA-SYSINFO_STORAGE_HEADING"
                Sysinfo_storage_group.appendChild(Sysinfo_storage_heading)

                  var Sysinfo_storage_heading_value = document.createElement("div")
                  Sysinfo_storage_heading_value.id = "GA-SYSINFO_STORAGE_VALUE"
                  Sysinfo_storage_heading_value.textContent = this.translate("GW_System_StorageSystem")
                  Sysinfo_storage_heading.appendChild(Sysinfo_storage_heading_value)

                var Sysinfo_storage_list = document.createElement("div")
                Sysinfo_storage_list.id = "GA-SYSINFO_STORAGE_LIST"
                Sysinfo_storage_group.appendChild(Sysinfo_storage_list)

                  var Sysinfo_storage_table = document.createElement("table")
                  Sysinfo_storage_table.id = "GA-SYSINFO_STORAGE_TABLE"
                  Sysinfo_storage_list.appendChild(Sysinfo_storage_table)

                    var Sysinfo_storage_table_header = document.createElement("tr")
                      Sysinfo_storage_table_header.id = "GA-SYSINFO_STORAGE_TABLE_HEADER"
                      Sysinfo_storage_table.appendChild(Sysinfo_storage_table_header)

                        var Sysinfo_storage_table_mount = document.createElement("th")
                        Sysinfo_storage_table_mount.id = "GA-SYSINFO_STORAGE_TABLE_MOUNT"
                        Sysinfo_storage_table_mount.textContent = this.translate("GW_System_MountStorage")
                        Sysinfo_storage_table_header.appendChild(Sysinfo_storage_table_mount)

                        var Sysinfo_storage_table_used = document.createElement("th")
                        Sysinfo_storage_table_used.id = "GA-SYSINFO_STORAGE_TABLE_USED"
                        Sysinfo_storage_table_used.textContent = this.translate("GW_System_UsedStorage")
                        Sysinfo_storage_table_header.appendChild(Sysinfo_storage_table_used)

                        var Sysinfo_storage_table_percent = document.createElement("th")
                        Sysinfo_storage_table_percent.id = "GA-SYSINFO_STORAGE_TABLE_PERCENT"
                        Sysinfo_storage_table_percent.textContent = this.translate("GW_System_PercentStorage")
                        Sysinfo_storage_table_header.appendChild(Sysinfo_storage_table_percent)

                        var Sysinfo_storage_table_total = document.createElement("th")
                        Sysinfo_storage_table_total.id = "GA-SYSINFO_STORAGE_TABLE_TOTAL"
                        Sysinfo_storage_table_total.textContent = this.translate("GW_System_TotalStorage")
                        Sysinfo_storage_table_header.appendChild(Sysinfo_storage_table_total)

            /** Network **/
            var Sysinfo_network = document.createElement("div")
            Sysinfo_network.id = "GA-SYSINFO_NETWORK"
            Sysinfo_container_row.appendChild(Sysinfo_network)

              var Sysinfo_network_group = document.createElement("div")
              Sysinfo_network_group.id = "GA-SYSINFO_NETWORK_GROUP"
              Sysinfo_network.appendChild(Sysinfo_network_group)

                var Sysinfo_network_heading = document.createElement("div")
                Sysinfo_network_heading.id = "GA-SYSINFO_NETWORK_HEADING"
                Sysinfo_network_group.appendChild(Sysinfo_network_heading)

                  var Sysinfo_network_heading_bar = document.createElement("div")
                  Sysinfo_network_heading_bar.id = "GA-SYSINFO_NETWORK_BAR"
                  Sysinfo_network_heading_bar.className = "SysInfo-icon__signal-strength SysInfo-signal-0 hidden"
                  Sysinfo_network_heading.appendChild(Sysinfo_network_heading_bar)

                    var Sysinfo_network_heading_bar1 = document.createElement("span")
                    Sysinfo_network_heading_bar1.className = "SYSINFO_BAR-1"
                    Sysinfo_network_heading_bar.appendChild(Sysinfo_network_heading_bar1)

                    var Sysinfo_network_heading_bar2 = document.createElement("span")
                    Sysinfo_network_heading_bar2.className = "SYSINFO_BAR-2"
                    Sysinfo_network_heading_bar.appendChild(Sysinfo_network_heading_bar2)

                    var Sysinfo_network_heading_bar3 = document.createElement("span")
                    Sysinfo_network_heading_bar3.className = "SYSINFO_BAR-3"
                    Sysinfo_network_heading_bar.appendChild(Sysinfo_network_heading_bar3)

                    var Sysinfo_network_heading_bar4 = document.createElement("span")
                    Sysinfo_network_heading_bar4.className = "SYSINFO_BAR-4"
                    Sysinfo_network_heading_bar.appendChild(Sysinfo_network_heading_bar4)

                  var Sysinfo_network_heading_value = document.createElement("div")
                  Sysinfo_network_heading_value.id = "GA-SYSINFO_NETWORK_HEADING_VALUE"
                  Sysinfo_network_heading_value.textContent = this.translate("GW_System_NetworkSystem")
                  Sysinfo_network_heading.appendChild(Sysinfo_network_heading_value)

                var Sysinfo_network_list = document.createElement("div")
                Sysinfo_network_list.id = "GA-SYSINFO_NETWORK_LIST"
                Sysinfo_network_group.appendChild(Sysinfo_network_list)

                  var IP = document.createElement("div")
                  IP.id = "GA-SYSINFO_NETWORK-IP"
                  IP.textContent = this.translate("GW_System_IPNetwork")
                  Sysinfo_network_list.appendChild(IP)
                    var IP_Value = document.createElement("div")
                    IP_Value.id = "GA-SYSINFO_NETWORK-IP-VALUE"
                    IP_Value.textContent= this.System.NETWORK.ip
                    IP.appendChild(IP_Value)

                  var Interface = document.createElement("div")
                  Interface.id = "GA-SYSINFO_NETWORK-INTERFACE"
                  Interface.textContent = this.translate("GW_System_InterfaceNetwork")
                  Sysinfo_network_list.appendChild(Interface)
                    var Interface_Value = document.createElement("div")
                    Interface_Value.id = "GA-SYSINFO_NETWORK-INTERFACE-VALUE"
                    Interface_Value.textContent= this.System.NETWORK.name
                    Interface.appendChild(Interface_Value)

                  var Information = document.createElement("div")
                  Information.id = "GA-SYSINFO_NETWORK_INFORMATION"
                  Information.textContent = this.translate("GW_System_WirelessInfo")
                  Sysinfo_network_list.appendChild(Information)

                  var Speed = document.createElement("div")
                  Speed.id = "GA-SYSINFO_NETWORK-SPEED"
                  Speed.textContent = this.translate("GW_System_SpeedNetwork")
                  Sysinfo_network_list.appendChild(Speed)
                    var Speed_Value = document.createElement("div")
                    Speed_Value.id = "GA-SYSINFO_NETWORK-SPEED-VALUE"
                    Speed_Value.textContent= this.System.NETWORK.speed
                    Speed.appendChild(Speed_Value)

                  var Duplex = document.createElement("div")
                  Duplex.id = "GA-SYSINFO_NETWORK-DUPLEX"
                  Duplex.textContent = this.translate("GW_System_DuplexNetwork")
                  Sysinfo_network_list.appendChild(Duplex)
                    var Duplex_Value = document.createElement("div")
                    Duplex_Value.id = "GA-SYSINFO_NETWORK-DUPLEX-VALUE"
                    Duplex_Value.textContent= this.System.NETWORK.duplex
                    Duplex.appendChild(Duplex_Value)

                  var SSID = document.createElement("div")
                  SSID.id = "GA-SYSINFO_NETWORK-SSID"
                  SSID.textContent = this.translate("GW_System_SSIDNetwork")
                  Sysinfo_network_list.appendChild(SSID)
                    var SSID_Value = document.createElement("div")
                    SSID_Value.id = "GA-SYSINFO_NETWORK-SSID-VALUE"
                    SSID_Value.textContent= this.System.NETWORK.ssid
                    SSID.appendChild(SSID_Value)

                  var bitRate = document.createElement("div")
                  bitRate.id = "GA-SYSINFO_NETWORK-RATE"
                  bitRate.textContent = this.translate("GW_System_RateNetwork")
                  Sysinfo_network_list.appendChild(bitRate)
                    var bitRate_Value = document.createElement("div")
                    bitRate_Value.id = "GA-SYSINFO_NETWORK-RATE-VALUE"
                    bitRate_Value.textContent= this.System.NETWORK.bitRate
                    bitRate.appendChild(bitRate_Value)

                  var frequency = document.createElement("div")
                  frequency.id = "GA-SYSINFO_NETWORK-FREQUENCY"
                  frequency.textContent = this.translate("GW_System_FrequencyNetwork")
                  Sysinfo_network_list.appendChild(frequency)
                    var frequency_Value = document.createElement("div")
                    frequency_Value.id = "GA-SYSINFO_NETWORK-FREQUENCY-VALUE"
                    frequency_Value.textContent= this.System.NETWORK.frequency
                    frequency.appendChild(frequency_Value)

                  var quality = document.createElement("div")
                  quality.id = "GA-SYSINFO_NETWORK-QUALITY"
                  quality.textContent = this.translate("GW_System_QualityNetwork")
                  Sysinfo_network_list.appendChild(quality)
                    var quality_Value = document.createElement("div")
                    quality_Value.id = "GA-SYSINFO_NETWORK-QUALITY-VALUE"
                    quality_Value.textContent= this.System.NETWORK.linkQuality + " (" + this.System.NETWORK.maxLinkQuality + ")"
                    quality.appendChild(quality_Value)

                  var Signal = document.createElement("div")
                  Signal.id = "GA-SYSINFO_NETWORK-SIGNAL"
                  Signal.textContent = this.translate("GW_System_SignalNetwork")
                  Sysinfo_network_list.appendChild(Signal)
                    var Signal_Value = document.createElement("div")
                    Signal_Value.id = "GA-SYSINFO_NETWORK-SIGNAL-VALUE"
                    Signal_Value.textContent= this.System.NETWORK.signalLevel
                    Signal.appendChild(Signal_Value)

            /** uptimes **/
            var Sysinfo_uptimes = document.createElement("div")
            Sysinfo_uptimes.id = "GA-SYSINFO_UPTIMES"
            Sysinfo_container_row.appendChild(Sysinfo_uptimes)

              var Sysinfo_uptimes_group = document.createElement("div")
              Sysinfo_uptimes_group.id = "GA-SYSINFO_UPTIMES_GROUP"
              Sysinfo_uptimes.appendChild(Sysinfo_uptimes_group)

                var Sysinfo_uptimes_heading = document.createElement("div")
                Sysinfo_uptimes_heading.id = "GA-SYSINFO_UPTIMES_HEADING"
                Sysinfo_uptimes_group.appendChild(Sysinfo_uptimes_heading)

                  var Sysinfo_uptimes_heading_value = document.createElement("div")
                  Sysinfo_uptimes_heading_value.id = "GA-SYSINFO_MEMORY_UPTIMES_VALUE"
                  Sysinfo_uptimes_heading_value.textContent = this.translate("GW_System_UptimeSystem")
                  Sysinfo_uptimes_heading.appendChild(Sysinfo_uptimes_heading_value)

                var Sysinfo_uptimes_list = document.createElement("div")
                Sysinfo_uptimes_list.id = "GA-SYSINFO_UPTIMES_LIST"
                Sysinfo_uptimes_group.appendChild(Sysinfo_uptimes_list)

                  var Sysinfo_uptime_current = document.createElement("div")
                  Sysinfo_uptime_current.id = "GA-SYSINFO_UPTIMES_CURRENT"
                  Sysinfo_uptime_current.textContent = this.translate("GW_System_CurrentUptime")
                  Sysinfo_uptimes_list.appendChild(Sysinfo_uptime_current)

                  var Sysinfo_uptime_current_system = document.createElement("div")
                  Sysinfo_uptime_current_system.id = "GA-SYSINFO_UPTIMES_CURRENT_SYSTEM"
                  Sysinfo_uptime_current_system.textContent = this.translate("GW_System_System")
                  Sysinfo_uptimes_list.appendChild(Sysinfo_uptime_current_system)
                  
                    var Sysinfo_uptime_current_system_value = document.createElement("div")
                    Sysinfo_uptime_current_system_value.id = "GA-SYSINFO_UPTIMES_CURRENT_SYSTEM_VALUE"
                    Sysinfo_uptime_current_system_value.textContent = this.System.UPTIME.currentDHM
                    Sysinfo_uptime_current_system.appendChild(Sysinfo_uptime_current_system_value)

                  var Sysinfo_uptime_current_MM = document.createElement("div")
                  Sysinfo_uptime_current_MM.id = "GA-SYSINFO_UPTIMES_CURRENT_MM"
                  Sysinfo_uptime_current_MM.textContent = "MagicMirror²:"
                  Sysinfo_uptimes_list.appendChild(Sysinfo_uptime_current_MM)
                  
                    var Sysinfo_uptime_current_MM_value = document.createElement("div")
                    Sysinfo_uptime_current_MM_value.id = "GA-SYSINFO_UPTIMES_CURRENT_MM_VALUE"
                    Sysinfo_uptime_current_MM_value.textContent = this.System.UPTIME.MMDHM
                    Sysinfo_uptime_current_MM.appendChild(Sysinfo_uptime_current_MM_value)

                  var Sysinfo_uptime_record = document.createElement("div")
                  Sysinfo_uptime_record.id = "GA-SYSINFO_UPTIMES_RECORD"
                  Sysinfo_uptime_record.textContent = this.translate("GW_System_RecordUptime")
                  Sysinfo_uptimes_list.appendChild(Sysinfo_uptime_record)

                  var Sysinfo_uptime_record_system = document.createElement("div")
                  Sysinfo_uptime_record_system.id = "GA-SYSINFO_UPTIMES_RECORD_SYSTEM"
                  Sysinfo_uptime_record_system.textContent = this.translate("GW_System_System")
                  Sysinfo_uptimes_list.appendChild(Sysinfo_uptime_record_system)
                  
                    var Sysinfo_uptime_record_system_value = document.createElement("div")
                    Sysinfo_uptime_record_system_value.id = "GA-SYSINFO_UPTIMES_RECORD_SYSTEM_VALUE"
                    Sysinfo_uptime_record_system_value.textContent = this.System.UPTIME.currentDHM
                    Sysinfo_uptime_record_system.appendChild(Sysinfo_uptime_record_system_value)

                  var Sysinfo_uptime_record_MM = document.createElement("div")
                  Sysinfo_uptime_record_MM.id = "GA-SYSINFO_UPTIMES_RECORD_MM"
                  Sysinfo_uptime_record_MM.textContent = "MagicMirror²:"
                  Sysinfo_uptimes_list.appendChild(Sysinfo_uptime_record_MM)
                  
                    var Sysinfo_uptime_record_MM_value = document.createElement("div")
                    Sysinfo_uptime_record_MM_value.id = "GA-SYSINFO_UPTIMES_RECORD_MM_VALUE"
                    Sysinfo_uptime_record_MM_value.textContent = this.System.UPTIME.MMDHM
                    Sysinfo_uptime_record_MM.appendChild(Sysinfo_uptime_record_MM_value)

    document.body.appendChild(wrapper)
    this.init=true
    console.log("[GA] SysInfo Ready !")
  }

  show() {
    if (!this.showing && this.init) {
      this.lock()
      clearInterval(this.timerRefresh)
      clearTimeout(this.timerHide)
      this.updateTimer()
      MM.getModules().enumerate((module)=> {
        module.hide(500, () => {}, {lockString: "GA_SYSINFO_LOCK"})
      })
      logGA("show sysinfo")
      var SysInfo=document.getElementById("GA_SYSINFO")
      SysInfo.classList.remove("hidden")
      removeAnimateCSS("GA_SYSINFO", "backOutRight")
      addAnimateCSS("GA_SYSINFO", "backInLeft", 1)
      this.showing = true
    }
  }

  hide() {
    if (this.showing && this.init) {
      clearInterval(this.timerRefresh)
      clearTimeout(this.timerHide)
      logGA("hide sysinfo")
      var SysInfo=document.getElementById("GA_SYSINFO")
      removeAnimateCSS("GA_SYSINFO", "backInLeft")
      addAnimateCSS("GA_SYSINFO", "backOutRight", 1)
      this.timerHide = setTimeout(()=> {
        SysInfo.classList.add("hidden")
        this.showing = false
        MM.getModules().enumerate((module)=> {
          module.show(500, () => {}, {lockString: "GA_SYSINFO_LOCK"})
        })
        this.unLock()
      },1000)
    }
  }

  updateSystemData(data) {
    this.System=Object.assign({},this.System,data)
    this.refreshData()
    logGA("system Info updated:",this.System)
  }

  refreshData() {
    var Hostname_value = document.getElementById("GA-HOSTNAME_VALUE")
    Hostname_value.textContent = this.System.HOSTNAME

    /* GPU */
    var GPU_value = document.getElementById("GA-GPU_VALUE")
    let animateGPUWarn = ["animate__animated", "animate__flash", "animate__infinite"]
    GPU_value.textContent = this.System.GPU ? this.translate("GW_System_GPUAcceleration_Enabled") : this.translate("GW_System_GPUAcceleration_Disabled")
    if (this.System.GPU) {
      GPU_value.classList.remove(...animateGPUWarn)
      GPU_value.classList.remove("red")
      GPU_value.classList.add("green")
    } else {
      GPU_value.classList.add(...animateGPUWarn)
      GPU_value.classList.remove("green")
      GPU_value.classList.add("red")
    }
    /* Version */
    var GA_Value = document.getElementById("GA-SYSINFO_VERSION-GA-VALUE")
    GA_Value.textContent = this.System.VERSION.GA
    var MM_Value = document.getElementById("GA-SYSINFO_VERSION-MM-VALUE")
    MM_Value.textContent = this.System.VERSION.MagicMirror
    var ELECTRON_Value = document.getElementById("GA-SYSINFO_VERSION-ELECTRON-VALUE")
    ELECTRON_Value.textContent = this.System.VERSION.ELECTRON
    var MMNode_Value = document.getElementById("GA-SYSINFO_VERSION-MMNODE-VALUE")
    MMNode_Value.textContent = this.System.VERSION.NODEMM
    var Node_Value = document.getElementById("GA-SYSINFO_VERSION-NODE-VALUE")
    Node_Value.textContent = this.System.VERSION.NODECORE
    var NPM_Value = document.getElementById("GA-SYSINFO_VERSION-NPM-VALUE")
    NPM_Value.textContent = this.System.VERSION.NPM
    var OS_Value = document.getElementById("GA-SYSINFO_VERSION-OS-VALUE")
    OS_Value.textContent = this.System.VERSION.OS
    var Kernel_Value = document.getElementById("GA-SYSINFO_VERSION-KERNEL-VALUE")
    Kernel_Value.textContent = this.System.VERSION.KERNEL

    /* CPU */
    var Type_Value = document.getElementById("GA-SYSINFO_CPU-TYPE-VALUE")
    Type_Value.textContent = this.System.CPU.type
    var Speed_Value = document.getElementById("GA-SYSINFO_CPU-SPEED-VALUE")
    Speed_Value.textContent= this.System.CPU.speed
    var Usage_Bar = document.getElementById("GA-SYSINFO_CPU-USAGE-PROGRESSBAR")
    Usage_Bar.style.width = this.System.CPU.usage + "%"
    Usage_Bar.style.backgroundColor = this.selectColor(this.System.CPU.usage)
    Usage_Bar.textContent = this.System.CPU.usage + "%"
    var Governor_Value = document.getElementById("GA-SYSINFO_CPU-GOVERNOR-VALUE")
    Governor_Value.textContent= this.System.CPU.governor
    var Temp_Bar = document.getElementById("GA-SYSINFO_CPU-TEMP-PROGRESSBAR")
    Temp_Bar.style.width = this.System.CPU.temp.C + "%"
    Temp_Bar.style.backgroundColor = this.selectColor(this.System.CPU.temp.C)
    Temp_Bar.textContent = this.System.CPU.temp.C + "°"

    /* MEMORY */
    var Active_ValueTotal = document.getElementById("GA-SYSINFO_MEMORY-ACTIVE-VALUE-TOTAL")
    Active_ValueTotal.textContent = this.System.MEMORY.total
    var Active_Bar = document.getElementById("GA-SYSINFO_MEMORY-ACTIVE-PROGRESSBAR")
    Active_Bar.style.width = this.System.MEMORY.percent + "%"
    Active_Bar.style.backgroundColor = this.selectColor(this.System.MEMORY.percent)
    Active_Bar.textContent = this.System.MEMORY.used
    
    var Swap_ValueTotal = document.getElementById("GA-SYSINFO_MEMORY-SWAP-VALUE-TOTAL")
    Swap_ValueTotal.textContent= this.System.MEMORY.swapTotal
    var Swap_Bar = document.getElementById("GA-SYSINFO_MEMORY-SWAP-PROGRESSBAR")
    Swap_Bar.style.width = this.System.MEMORY.swapPercent + "%"
    Swap_Bar.style.backgroundColor = this.selectColor(this.System.MEMORY.swapPercent)
    Swap_Bar.textContent = this.System.MEMORY.swapUsed

    /* Uptimes*/
    var uptime_current_system = document.getElementById("GA-SYSINFO_UPTIMES_CURRENT_SYSTEM_VALUE")
    uptime_current_system.textContent = this.System.UPTIME.currentDHM
    var uptime_current_MM = document.getElementById("GA-SYSINFO_UPTIMES_CURRENT_MM_VALUE")
    uptime_current_MM.textContent = this.System.UPTIME.MMDHM
    var uptime_record_system = document.getElementById("GA-SYSINFO_UPTIMES_RECORD_SYSTEM_VALUE")
    uptime_record_system.textContent = this.System.UPTIME.recordCurrentDHM
    var uptime_record_MM = document.getElementById("GA-SYSINFO_UPTIMES_RECORD_MM_VALUE")
    uptime_record_MM.textContent = this.System.UPTIME.recordMMDHM

    /* NETWORK */
    var information = document.getElementById("GA-SYSINFO_NETWORK_INFORMATION")
    var IP = document.getElementById("GA-SYSINFO_NETWORK-IP-VALUE")
    IP.textContent= this.System.NETWORK.ip
    var Interface = document.getElementById("GA-SYSINFO_NETWORK-INTERFACE-VALUE")
    Interface.textContent= this.System.NETWORK.name
    var Speed_ = document.getElementById("GA-SYSINFO_NETWORK-SPEED")
    var Speed = document.getElementById("GA-SYSINFO_NETWORK-SPEED-VALUE")
    Speed.textContent= this.System.NETWORK.speed + " Mbit/s"
    var Duplex_ = document.getElementById("GA-SYSINFO_NETWORK-DUPLEX")
    var Duplex = document.getElementById("GA-SYSINFO_NETWORK-DUPLEX-VALUE")
    Duplex.textContent= this.System.NETWORK.duplex
    // wireless
    var SSID_ = document.getElementById("GA-SYSINFO_NETWORK-SSID")
    var SSID = document.getElementById("GA-SYSINFO_NETWORK-SSID-VALUE")
    SSID.textContent = this.System.NETWORK.ssid
    var bitRate_ = document.getElementById("GA-SYSINFO_NETWORK-RATE")
    var bitRate = document.getElementById("GA-SYSINFO_NETWORK-RATE-VALUE")
    bitRate.textContent= this.System.NETWORK.rate + " Mb/s"
    var frequency_ = document.getElementById("GA-SYSINFO_NETWORK-FREQUENCY")
    var frequency = document.getElementById("GA-SYSINFO_NETWORK-FREQUENCY-VALUE")
    frequency.textContent= this.System.NETWORK.frequency + " GHz"
    var quality_ = document.getElementById("GA-SYSINFO_NETWORK-QUALITY")
    var quality = document.getElementById("GA-SYSINFO_NETWORK-QUALITY-VALUE")
    quality.textContent = this.System.NETWORK.quality
    var Signal_ = document.getElementById("GA-SYSINFO_NETWORK-SIGNAL")
    var Signal = document.getElementById("GA-SYSINFO_NETWORK-SIGNAL-VALUE")
    Signal.textContent= this.System.NETWORK.signalLevel + " dBm"
    var bar = document.getElementById("GA-SYSINFO_NETWORK_BAR")
    if (this.System.NETWORK.type == "wired") {
      bar.classList.add("hidden")
      information.classList.remove("hidden")
      Speed_.classList.remove("hidden")
      Speed.classList.remove("hidden")
      Duplex_.classList.remove("hidden")
      Duplex.classList.remove("hidden")
      SSID_.classList.add("hidden")
      SSID.classList.add("hidden")
      bitRate_.classList.add("hidden")
      bitRate.classList.add("hidden")
      frequency_.classList.add("hidden")
      frequency.classList.add("hidden")
      quality_.classList.add("hidden")
      quality.classList.add("hidden")
      Signal_.classList.add("hidden")
      Signal.classList.add("hidden")
    } else if (this.System.NETWORK.type == "wireless") {
      bar.classList.remove("hidden")
      information.classList.remove("hidden")
      Speed_.classList.add("hidden")
      Speed.classList.add("hidden")
      Duplex_.classList.add("hidden")
      Duplex.classList.add("hidden")
      SSID_.classList.remove("hidden")
      SSID.classList.remove("hidden")
      bitRate_.classList.remove("hidden")
      bitRate.classList.remove("hidden")
      frequency_.classList.remove("hidden")
      frequency.classList.remove("hidden")
      quality_.classList.remove("hidden")
      quality.classList.remove("hidden")
      Signal_.classList.remove("hidden")
      Signal.classList.remove("hidden")
      bar.classList.remove("SysInfo-signal-0")
      bar.classList.remove("SysInfo-signal-1")
      bar.classList.remove("SysInfo-signal-2")
      bar.classList.remove("SysInfo-signal-3")
      bar.classList.remove("SysInfo-signal-4")
      bar.classList.add("SysInfo-signal-"+ this.System.NETWORK.barLevel)
    } else {
      bar.classList.add("hidden")
      information.classList.add("hidden")
      Speed_.classList.add("hidden")
      Speed.classList.add("hidden")
      Duplex_.classList.add("hidden")
      Duplex.classList.add("hidden")
      SSID_.classList.add("hidden")
      SSID.classList.add("hidden")
      bitRate_.classList.add("hidden")
      bitRate.classList.add("hidden")
      frequency_.classList.add("hidden")
      frequency.classList.add("hidden")
      quality_.classList.add("hidden")
      quality.classList.add("hidden")
      Signal_.classList.add("hidden")
      Signal.classList.add("hidden")
    }

    // storage
    var Sysinfo_storage_table = document.getElementById("GA-SYSINFO_STORAGE_TABLE")
    this.System.STORAGE.forEach((partition, id) => {
      for (let [name, values] of Object.entries(partition)) {
        var check_mount = document.getElementById("GA-SYSINFO_STORAGE-MOUNTVALUES" + id)
        if (check_mount) {
          // update
          var update_name = check_mount.getElementsByClassName("STORAGE-MOUNT" + id)[0]
          update_name.textContent = name
          var update_used = check_mount.getElementsByClassName("STORAGE-USED" + id)[0]
          update_used.textContent = values.used
          var update_size = check_mount.getElementsByClassName("STORAGE-SIZE" + id)[0]
          update_size.textContent = values.size
          var update_progress = check_mount.getElementsByClassName("STORAGE-PROGRESSBAR" + id)[0]
          update_progress.style.width = values.use + "%"
          update_progress.style.backgroundColor = this.selectColor(values.use)
          update_progress.textContent = values.use + "%"
          continue
        }

        // create
        var Sysinfo_storage_mountValues = document.createElement("tr")
        Sysinfo_storage_mountValues.id = "GA-SYSINFO_STORAGE-MOUNTVALUES" + id
        Sysinfo_storage_table.appendChild(Sysinfo_storage_mountValues)

        var Sysinfo_storage_mount = document.createElement("td")
        Sysinfo_storage_mount.id = "GA-SYSINFO_STORAGE-MOUNT"
        Sysinfo_storage_mount.classList = "STORAGE-MOUNT" + id
        Sysinfo_storage_mount.textContent = name
        Sysinfo_storage_mountValues.appendChild(Sysinfo_storage_mount)

        var Sysinfo_storage_mount_used = document.createElement("td")
        Sysinfo_storage_mount_used.id = "GA-SYSINFO_STORAGE-USED"
        Sysinfo_storage_mount_used.classList = "STORAGE-USED" + id
        Sysinfo_storage_mount_used.textContent = values.used
        Sysinfo_storage_mountValues.appendChild(Sysinfo_storage_mount_used)

        var Sysinfo_storage_mount_ProgressField = document.createElement("td")
        Sysinfo_storage_mount_ProgressField.id = "GA-SYSINFO_STORAGE-PROGRESS-FIELD"
        Sysinfo_storage_mountValues.appendChild(Sysinfo_storage_mount_ProgressField)

          var Sysinfo_storage_mount_Progress = document.createElement("div")
          Sysinfo_storage_mount_Progress.id = "GA-SYSINFO_STORAGE-PROGRESS"
          Sysinfo_storage_mount_Progress.className = "SysInfo-progress"
          Sysinfo_storage_mount_ProgressField.appendChild(Sysinfo_storage_mount_Progress)

            var Sysinfo_storage_mount_ProgressBar = document.createElement("div")
            Sysinfo_storage_mount_ProgressBar.id = "GA-SYSINFO_STORAGE-PROGRESSBAR"
            Sysinfo_storage_mount_ProgressBar.className = "SysInfo-progress-bar"
            Sysinfo_storage_mount_ProgressBar.classList.add("STORAGE-PROGRESSBAR" + id)
            Sysinfo_storage_mount_ProgressBar.style.width = values.use + "%"
            Sysinfo_storage_mount_ProgressBar.style.backgroundColor = this.selectColor(values.use)
            Sysinfo_storage_mount_ProgressBar.textContent = values.use + "%"
            Sysinfo_storage_mount_Progress.appendChild(Sysinfo_storage_mount_ProgressBar)

        var Sysinfo_storage_mount_size = document.createElement("td")
        Sysinfo_storage_mount_size.id = "GA-SYSINFO_STORAGE-SIZE"
        Sysinfo_storage_mount_size.textContent = values.size
        Sysinfo_storage_mount_size.classList = "STORAGE-SIZE" + id
        Sysinfo_storage_mountValues.appendChild(Sysinfo_storage_mount_size)
      }
    })
  }

  updateTimer() {
    this.sendSocketNotification("GET-SYSINFO")
    this.timerRefresh = setInterval(() => {
      this.sendSocketNotification("GET-SYSINFO")
    }, 10000)
  }
  
  selectColor(value) {
    let color = "#212121"
    if (value <= 50) color = "#3cba54"
    else if (value >= 50 && value < 80) color = "#f4c20d"
    else if (value >= 80) color = "#db3236"
    return color
  }
}
