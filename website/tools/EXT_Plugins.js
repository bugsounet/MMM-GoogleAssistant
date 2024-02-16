/** EXT tools
* @bugsounet
**/

// rotate rules

PleaseRotateOptions = {
  startOnPageLoad: false
};

// define all vars
var translation = {};
var AllEXT = [];
var DescEXT = {};
var InstEXT = [];
var ConfigEXT = [];
var versionGW = {};

// Load rules
window.addEventListener("load", async (event) => {
  versionGW = await getGatewayVersion();
  translation = await loadTranslation();

  $("html").prop("lang", versionGW.lang);
  forceMobileRotate();
  switch (window.location.pathname) {
    case "/EXT":
      createEXTTable();
      break;
    case "/delete":
      doDelete();
      break;
    case "/install":
      doInstall();
      break;
    case "/EXTCreateConfig":
      EXTConfigJSEditor();
      break;
    case "/EXTDeleteConfig":
      EXTDeleteConfigJSEditor();
      break;
    case "/EXTModifyConfig":
      EXTModifyConfigJSEditor();
      break;
  }

  doTranslateNavBar();
});

async function createEXTTable () {
  $(document).prop("title", translation.Plugins);
  $("#Plugins_Welcome").text(translation.Plugins_Welcome);
  if (!AllEXT.length) AllEXT = await loadDataAllEXT();
  if (!Object.keys(DescEXT).length) DescEXT = await loadDataDescriptionEXT();
  if (!InstEXT.length) InstEXT = await loadDataInstalledEXT();
  if (!ConfigEXT.length) ConfigEXT = await loadDataConfiguredEXT();
  var Content = `<div id="TableSorterCard" class="card"><div class="row table-topper align-items-center"><div class="col-4 text-start" style="margin: 0px;padding: 5px 15px;"><button class="btn btn-primary btn-sm reset" type="button" style="padding: 5px;margin: 2px;">${translation.Plugins_Table_Reset}</button></div><div class="col-4 text-center" style="margin: 0px;padding: 5px 10px;"><h6 id="counter" style="margin: 0px;">${translation.Plugins_Table_Showing}<strong id="rowCount">${AllEXT.length}</strong>${translation.Plugins_Table_Plugins}</h6></div></div><div class="row"><div class="col-12"><div>`;

  Content += `<table id="ipi-table" class="table table tablesorter"><thead class="thead-dark"><tr><th>${translation.Plugins_Table_Name}</th><th class="sorter-false">${translation.Plugins_Table_Description}</th><th class="filter-false">${translation.Plugins_Table_Actions}</th><th class="filter-false">${translation.Plugins_Table_Configuration}</th></tr></thead><tbody id="EXT">`;

  AllEXT.forEach((pluginsName) => {
    // wiki page link
    Content += `<tr><td class="text-nowrap fs-6 text-start click" data-bs-toggle="tooltip" style="cursor: pointer;" data-href="https://wiki.bugsounet.fr/${pluginsName}" title="${translation.Plugins_Table_Wiki} ${pluginsName}">${pluginsName}</td><td>${DescEXT[pluginsName]}</td>`;

    // EXT install link
    if (InstEXT.indexOf(pluginsName) == -1) Content += `<td align="center"><a class="btn btn-primary btn-sm" role="button" data-bs-toggle="tooltip" title="${translation.Plugins_Table_Install} ${pluginsName}" href="/install?ext=${pluginsName}">${translation.Install}</a></td>`;
    // EXT delete link
    else Content += `<td align="center"><a class="btn btn-danger btn-sm" role="button" data-bs-toggle="tooltip" title="${translation.Plugins_Table_Delete} ${pluginsName}" href="/delete?ext=${pluginsName}">${translation.Delete}</a></td>`;

    if (InstEXT.indexOf(pluginsName) == -1) {
      if (ConfigEXT.indexOf(pluginsName) == -1) Content += "<td></td>";
      // config delete link
      else Content += `<td align="center"><a class="btn btn-danger btn-sm pulse animated infinite" data-bs-toggle="tooltip" title="${translation.Plugins_Table_DeleteConfig}" role="button" href="/EXTDeleteConfig?ext=${pluginsName}">${translation.Delete}</a></td>`;
    } else {
      // configure link
      if (ConfigEXT.indexOf(pluginsName) == -1) Content += `<td align="center"><a class="btn btn-warning btn-sm pulse animated infinite" data-bs-toggle="tooltip" title="${translation.Plugins_Table_Configure}" role="button" href="/EXTCreateConfig?ext=${pluginsName}">${translation.Configure}</a></td>`;
      // modify link
      else Content += `<td align="center"><a class="btn btn-success btn-sm" data-bs-toggle="tooltip" title="${translation.Plugins_Table_Modify}" role="button" href="/EXTModifyConfig?ext=${pluginsName}">${translation.Modify}</a></td>`;
    }
    Content += "</tr>";
  });

  Content += "</tbody></table></div></div></div></div>";
  $("#EXTable").append(Content);
  $("td[class*=\"click\"").click(function () {
    var win = window.open($(this).data("href"), "_blank");
    if (win) {
      win.focus();
    } else {
      //Browser has blocked it
      alert("Please allow popups for this website");
    }
  });
  enableSearchAndSort();
}

function doDelete () {
  var EXT = decodeURIComponent(window.location.search.match(/(\?|&)ext\=([^&]*)/)[2]);
  $(document).prop("title", translation.Plugins);
  $("#TerminalHeader").text(translation.Plugins_Delete_TerminalHeader);
  var socketDelete = io();
  const termDelete = new Terminal({ cursorBlink: true });
  const fitAddonDelete = new FitAddon.FitAddon();
  termDelete.loadAddon(fitAddonDelete);
  termDelete.open(document.getElementById("terminal"));
  fitAddonDelete.fit();

  socketDelete.on("connect", () => {
    termDelete.write(`\x1B[1;3;31mMMM-GoogleAssistant v${versionGW.v} (${versionGW.rev}.${versionGW.lang})\x1B[0m \r\n\n`);
  });

  socketDelete.on("disconnect", () => {
    termDelete.write("\r\n\n\x1B[1;3;31mDisconnected\x1B[0m\r\n");
  });

  socketDelete.io.on("error", (data) => {
    console.log("Socket Error:", data);
    socketDelete.close();
  });

  socketDelete.on("terminal.delete", function (data) {
    termDelete.write(data);
  });

  $("#messageText").text(translation.Plugins_Delete_Message);
  $("#EXT-Name").text(EXT);
  $("#delete").text(translation.Delete);

  document.getElementById("delete").onclick = function () {
    $("#messageText").text(translation.Plugins_Delete_Progress);
    $("#delete").addClass("disabled");
    return new Promise((resolve) => {
      $.getJSON(`/EXTDelete?EXT=${EXT}`, (res) => {
        if (!res.error) $("#messageText").text(translation.Plugins_Delete_Confirmed);
        else $("#messageText").text(translation.Warn_Error);
        resolve();
        setTimeout(() => socketDelete.close(), 500);
      })
        .fail(function (err) {
          alertify.error(`[doDelete] Server return Error ${err.status} (${err.statusText})`);
        });
    });
  };
}

function doInstall () {
  var EXT = decodeURIComponent(window.location.search.match(/(\?|&)ext\=([^&]*)/)[2]);
  $(document).prop("title", translation.Plugins);
  $("#TerminalHeader").text(translation.Plugins_Install_TerminalHeader);
  var socketInstall = io();
  const termInstall = new Terminal({ cursorBlink: true });
  const fitAddonInstall = new FitAddon.FitAddon();
  termInstall.loadAddon(fitAddonInstall);
  termInstall.open(document.getElementById("terminal"));
  fitAddonInstall.fit();

  socketInstall.on("connect", () => {
    termInstall.write(`\x1B[1;3;31mMMM-GoogleAssistant v${versionGW.v} (${versionGW.rev}.${versionGW.lang})\x1B[0m \r\n\n`);
  });

  socketInstall.io.on("error", (data) => {
    console.log("Socket Error:", data);
    socketInstall.close();
  });

  socketInstall.on("disconnect", () => {
    termInstall.write("\r\n\n\x1B[1;3;31mDisconnected\x1B[0m\r\n");
  });

  socketInstall.on("terminal.installer", function (data) {
    termInstall.write(data);
  });

  $("#messageText").text(translation.Plugins_Install_Message);
  $("#EXT-Name").text(EXT);
  $("#install").text(translation.Install);

  document.getElementById("install").onclick = function () {
    $("#messageText").text(translation.Plugins_Install_Progress);
    $("#install").addClass("disabled");
    return new Promise((resolve) => {
      $.getJSON(`/EXTInstall?EXT=${EXT}`, (res) => {
        if (!res.error) $("#messageText").text(translation.Plugins_Install_Confirmed);
        else $("#messageText").text(translation.Warn_Error);
        resolve();
        setTimeout(() => socketInstall.close(), 500);
      })
        .fail(function (err) {
          alertify.error(`[doInstall] Server return Error ${err.status} (${err.statusText})`);
        });
    });
  };
}

function enableSearchAndSort () {
  $("#ipi-table").tablesorter({
    theme: "bootstrap",
    widthFixed: true,
    widgets: ["filter", "columns", "zebra"],
    ignoreCase: false,
    widgetOptions: {
      zebra: ["even", "odd"],
      columns: ["primary", "secondary", "tertiary"],
      filter_childRows: false,
      filter_childByColumn: false,
      filter_childWithSibs: true,
      filter_columnFilters: true,
      filter_columnAnyMatch: true,
      filter_cellFilter: "",
      filter_cssFilter: "", // or []
      filter_defaultFilter: {},
      filter_excludeFilter: {},
      filter_external: "",
      filter_filteredRow: "filtered",
      filter_filterLabel: "Filter \"{{label}}\" column by...",
      filter_formatter: null,
      filter_functions: null,
      filter_hideEmpty: true,
      filter_hideFilters: false,
      filter_ignoreCase: true,
      filter_liveSearch: true,
      filter_matchType: { input: "exact", select: "exact" },
      filter_onlyAvail: "filter-onlyAvail",
      filter_placeholder: { search: translation.Plugins_Table_Search, select: "" },
      filter_reset: "button.reset",
      filter_resetOnEsc: true,
      filter_saveFilters: true,
      filter_searchDelay: 300,
      filter_searchFiltered: true,
      filter_selectSource: null,
      filter_serversideFiltering: false,
      filter_startsWith: false,
      filter_useParsedData: false,
      filter_defaultAttrib: "data-value",
      filter_selectSourceSeparator: "|"
    }
  });

  $(".resetsaved").click(function () {
    $("#ipi-table").trigger("filterResetSaved");

    var $message = $("<span class=\"results\"> Reset</span>").insertAfter(this);
    setTimeout(function () {
      $message.remove();
    }, 500);
    return false;
  });

  $("button[data-filter-column]").click(function () {
    var filters = [],
      $t = $(this),
      col = $t.data("filter-column"),
      txt = $t.data("filter-text") || $t.text();

    filters[col] = txt;
    $.tablesorter.setFilters($("#table"), filters, true);

    return false;
  });

  $("table").bind("filterEnd", function (event, filteredRows) {
    var rowCount = document.getElementById("rowCount");
    if (typeof rowCount !== "undefined") {
      var text = document.createTextNode(filteredRows.filteredRows);
      jQuery("#rowCount").html("");
      rowCount.appendChild(text);
    }
  });
}

async function EXTConfigJSEditor () {
  $(document).prop("title", translation.Plugins);
  $("#title").text(translation.Plugins_Initial_Title);
  $("#wait").text(translation.Wait);
  $("#done").text(translation.Done);
  $("#error").text(translation.Error);
  $("#save").text(translation.Save);
  $("#wait").css("display", "none");
  $("#done").css("display", "none");
  $("#error").css("display", "none");
  $("#buttonGrp").removeClass("invisible");
  var EXT = decodeURIComponent(window.location.search.match(/(\?|&)ext\=([^&]*)/)[2]);
  $("#EXTName").text(EXT);
  var plugin = await loadPluginConfig(EXT);
  var template = await loadPluginTemplate(EXT);
  const container = document.getElementById("jsoneditor");

  const options = {
    schema: template,
    mode: "tree",
    modes: ["code", "tree"],
    enableTransform: false,
    enableSort: false,
    onValidate: (json) => {
      var errors = [];

      /** Special rules for EXT-Detector **/
      if (EXT == "EXT-Detector" && json && json.config && Array.isArray(json.config.detectors)) {
        var SnowboyValidator = ["smart_mirror", "jarvis", "computer", "snowboy", "subex", "neo_ya", "hey_extreme", "view_glass"];
        var PorcupineValidator = ["jarvis", "americano", "blueberry", "bumblebee", "grapefruit", "grasshopper", "hey google", "hey siri", "ok google", "picovoice", "porcupine", "terminator", "custom"];
        json.config.detectors.forEach((detector, index) => {
          if (detector.detector == "Snowboy" && SnowboyValidator.indexOf(detector.Model) == -1) {
            errors.push({
              path: ["config", "detectors", index, "Model"],
              message: `${detector.Model} is not comptatible with Snowboy detector`
            });
          }
          if (detector.detector == "Porcupine" && PorcupineValidator.indexOf(detector.Model) == -1) {
            errors.push({
              path: ["config", "detectors", index, "Model"],
              message: `${detector.Model} is not comptatible with Porcupine detector`
            });
          }
        });
      }

      /** Rules for not change module name **/
      if (json && json.module && json.module != EXT) {
        errors.push({
          path: ["module"],
          message: `${translation.ErrModule} ${EXT}`
        });
      }
      return errors;
    },
    onValidationError: (errors) => {
      if (errors.length) $("#save").css("display", "none");
      else $("#save").css("display", "block");
    }
  };
  const editor = new JSONEditor(container, options, plugin);
  editor.expandAll();
  document.getElementById("save").onclick = function () {
    let data = editor.getText();
    $("#save").css("display", "none");
    $("#wait").css("display", "block");
    $.post("/writeEXT", { data: data })
      .done(function (back) {
        if (back.error) {
          $("#wait").css("display", "none");
          $("#error").css("display", "block");
          $("#alert").removeClass("invisible");
          $("#alert").removeClass("alert-success");
          $("#alert").addClass("alert-danger");
          $("#messageText").text(back.error);
        } else {
          $("#wait").css("display", "none");
          $("#done").css("display", "block");
          $("#alert").removeClass("invisible");
          $("#messageText").text(translation.Restart);
        }
      })
      .fail(function (err) {
        alertify.error(`[writeEXT] Server return Error ${err.status} (${err.statusText})`);
      });
  };
}

async function EXTModifyConfigJSEditor () {
  $(document).prop("title", translation.Plugins);
  $("#title").text(translation.Plugins_Modify_Title);
  $("#wait").text(translation.Wait);
  $("#done").text(translation.Done);
  $("#error").text(translation.Error);
  $("#save").text(translation.Save);
  $("#wait").css("display", "none");
  $("#done").css("display", "none");
  $("#error").css("display", "none");
  $("#configError").css("display", "none");
  $("#buttonGrp").removeClass("invisible");
  $("#title").text(translation.Plugins_Modify_Title);
  $("#loadDefault").text(translation.LoadDefault);
  $("#mergeDefault").text(translation.MergeDefault);
  $("#configError").text(translation.Error);
  $("#buttonGrp2").removeClass("invisible");
  var EXT = undefined;
  if (window.location.search) {
    EXT = decodeURIComponent(window.location.search.match(/(\?|&)ext\=([^&]*)/)[2]);
  }
  $("#EXTName").text(EXT);
  var plugin = await loadPluginCurrentConfig(EXT);
  var template = await loadPluginTemplate(EXT);
  var defaultConfig = await loadPluginConfig(EXT);
  const container = document.getElementById("jsoneditor");

  const options = {
    schema: template,
    mode: "tree",
    modes: ["code", "tree"],
    enableTransform: false,
    enableSort: false,
    onValidate: (json) => {
      var errors = [];

      /** Special rules for EXT-Detector **/
      if (EXT == "EXT-Detector" && json && json.config && Array.isArray(json.config.detectors)) {
        var SnowboyValidator = ["smart_mirror", "jarvis", "computer", "snowboy", "subex", "neo_ya", "hey_extreme", "view_glass"];
        var PorcupineValidator = ["jarvis", "americano", "blueberry", "bumblebee", "grapefruit", "grasshopper", "hey google", "hey siri", "ok google", "picovoice", "porcupine", "terminator", "custom"];
        json.config.detectors.forEach((detector, index) => {
          if (detector.detector == "Snowboy" && SnowboyValidator.indexOf(detector.Model) == -1) {
            errors.push({
              path: ["config", "detectors", index, "Model"],
              message: `${detector.Model} ${translation.Plugins_Error_Snowboy}`
            });
          }
          if (detector.detector == "Porcupine" && PorcupineValidator.indexOf(detector.Model) == -1) {
            errors.push({
              path: ["config", "detectors", index, "Model"],
              message: `${detector.Model} ${translation.Plugins_Error_Porcupine}`
            });
          }
        });
      }

      /** Rules for not change module name **/
      if (json && json.module && json.module != EXT) {
        errors.push({
          path: ["module"],
          message: `${translation.ErrModule} ${EXT}`
        });
      }
      return errors;
    },
    onValidationError: (errors) => {
      if (errors.length) {
        $("#save").css("display", "none");
        $("#mergeDefault").css("display", "none");
        $("#configError").css("display", "block");
      } else {
        $("#configError").css("display", "none");
        $("#save").css("display", "block");
        $("#mergeDefault").css("display", "block");
      }
    }
  };
  const editor = new JSONEditor(container, options, plugin);
  editor.expandAll();
  document.getElementById("save").onclick = function () {
    let data = editor.getText();
    $("#save").css("display", "none");
    $("#wait").css("display", "block");
    $.post("/writeEXT", { data: data })
      .done(function (back) {
        if (back.error) {
          $("#wait").css("display", "none");
          $("#error").css("display", "block");
          $("#alert").removeClass("invisible");
          $("#alert").removeClass("alert-success");
          $("#alert").addClass("alert-danger");
          $("#messageText").text(back.error);
        } else {
          $("#wait").css("display", "none");
          $("#done").css("display", "block");
          $("#alert").removeClass("invisible");
          $("#messageText").text(translation.Restart);
        }
      })
      .fail(function (err) {
        alertify.error(`[writeEXT] Server return Error ${err.status} (${err.statusText})`);
      });
  };
  document.getElementById("loadDefault").onclick = async function () {
    editor.set(defaultConfig);
    editor.expandAll();
  };

  document.getElementById("mergeDefault").onclick = async function () {
    var actualConfig = editor.get();
    actualConfig = configMerge({}, defaultConfig, actualConfig);
    editor.set(actualConfig);
    editor.expandAll();
  };
}

async function EXTDeleteConfigJSEditor () {
  $(document).prop("title", translation.Plugins);
  $("#title").text(translation.Plugins_DeleteConfig_Title);
  $("#wait").text(translation.Wait);
  $("#done").text(translation.Done);
  $("#error").text(translation.Error);
  $("#confirm").text(translation.Confirm);
  $("#wait").css("display", "none");
  $("#done").css("display", "none");
  $("#error").css("display", "none");
  $("#buttonGrp").removeClass("invisible");
  $("#confirm").css("display", "block");
  var EXT = decodeURIComponent(window.location.search.match(/(\?|&)ext\=([^&]*)/)[2]);
  $("#EXTName").text(EXT);
  var plugin = await loadPluginCurrentConfig(EXT);
  const container = document.getElementById("jsoneditor");

  const options = {
    mode: "code",
    mainMenuBar: false,
    onEditable (node) {
      if (!node.path) {
        // In modes code and text, node is empty: no path, field, or value
        // returning false makes the text area read-only
        return false;
      }
    }
  };
  const editor = new JSONEditor(container, options, plugin);
  document.getElementById("confirm").onclick = function () {
    $("#confirm").css("display", "none");
    $("#wait").css("display", "block");
    $.post("/deleteEXT", { data: EXT })
      .done(function (back) {
        if (back.error) {
          $("#wait").css("display", "none");
          $("#error").css("display", "block");
          $("#alert").removeClass("invisible");
          $("#alert").removeClass("alert-success");
          $("#alert").addClass("alert-danger");
          $("#messageText").text(back.error);
        } else {
          $("#wait").css("display", "none");
          $("#done").css("display", "block");
          $("#alert").removeClass("invisible");
          $("#messageText").text(translation.Plugins_DeleteConfig_Confirmed);
        }
      })
      .fail(function (err) {
        alertify.error(`[deleteEXT] Server return Error ${err.status} (${err.statusText})`);
      });
  };
}
