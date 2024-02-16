/** EXT tools
* @bugsounet
**/

// rotate rules

PleaseRotateOptions = {
  startOnPageLoad: false
};

// define all vars
var translation = {};
var versionGW = {};

// Load rules
window.addEventListener("load", async (event) => {
  versionGW = await getGatewayVersion();
  translation = await loadTranslation();

  $("html").prop("lang", versionGW.lang);
  forceMobileRotate();
  switch (window.location.pathname) {
    case "/MMConfig":
      viewJSEditor();
      break;
    case "/EditMMConfig":
      EditMMConfigJSEditor();
      break;
  }

  doTranslateNavBar();
});

//make viewJSEditor
async function viewJSEditor () {
  $(document).prop("title", translation.Configuration);
  $("#MMConfigHeader").text(translation.Configuration_Welcome);
  $("#EditLoadButton").text(translation.Configuration_EditLoad);
  var modules = await loadMMConfig();
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
  const editor = new JSONEditor(container, options, modules);
}

async function EditMMConfigJSEditor () {
  $(document).prop("title", translation.Configuration);
  $("#MMConfigHeader").text(translation.Configuration_Edit_Title);
  $("#wait").text(translation.Wait);
  $("#done").text(translation.Done);
  $("#error").text(translation.Error);
  $("#errorConfig").text(translation.Error);
  $("#save").text(translation.Save);
  $("#load").text(translation.Load);
  $("#wait").css("display", "none");
  $("#done").css("display", "none");
  $("#error").css("display", "none");
  $("#errorConfig").css("display", "none");
  $("#load").css("display", "none");
  $("#save").css("display", "none");
  $("#buttonGrp").removeClass("invisible");
  $("select option:contains(\"Loading\")").text(translation.Configuration_Edit_AcualConfig);
  var allBackup = await loadBackupNames();
  var config = {};
  var conf = null;
  var options = {
    mode: "code",
    mainMenuBar: false,
    onValidationError: (errors) => {
      if (errors.length) {
        $("#save").css("display", "none");
        $("#externalSave").addClass("disabled");
        $("#errorConfig").css("display", "block");
      }
      else {
        $("#errorConfig").css("display", "none");
        $("#save").css("display", "block");
        $("#externalSave").removeClass("disabled");
      }
    }
  };

  if (window.location.search) {
    conf = decodeURIComponent(window.location.search.match(/(\?|&)config\=([^&]*)/)[2]);
    if (conf == "default") config = await loadMMConfig();
    else {
      options = {
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
      config = await loadBackupConfig(conf);
      $("#load").css("display", "block");
    }
  } else {
    conf = "default";
    config = await loadMMConfig();
  }
  $.each(allBackup, function (i, backup) {
    $("#backup").append($("<option>", {
      value: backup,
      text: backup,
      selected: (backup == conf) ? true : false
    }));
  });
  const container = document.getElementById("jsoneditor");
  const message = document.getElementById("messageText");
  const editor = new JSONEditor(container, options, config);
  document.getElementById("load").onclick = function () {
    $("#load").css("display", "none");
    $("#wait").css("display", "block");
    $.post("/loadBackup", { data: conf })
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
        alertify.error(`[loadBackup] Server return Error ${err.status} (${err.statusText})`);
      });
  };
  document.getElementById("save").onclick = function () {
    let data = editor.getText();
    $("#save").css("display", "none");
    $("#wait").css("display", "block");
    $.post("/writeConfig", { data: data })
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
        alertify.error(`[writeConfig] Server return Error ${err.status} (${err.statusText})`);
      });
  };
  FileReaderJS.setupInput(document.getElementById("fileToLoad"), {
    readAsDefault: "Text",
    on: {
      load (event, file) {
        if (event.target.result) {
          $.post("/readExternalBackup", { data: event.target.result })
            .done(function (back) {
              if (back.error) {
                alertify.error(`[readExternalBackup]${back.error}`);
              } else {
                editor.update(back.data);
                editor.refresh();
                alertify.success("External Config Loaded !");
              }
            })
            .fail(function (err) {
              alertify.error(`[readExternalBackup] Server return Error ${err.status} (${err.statusText})`);
            });
        }
      }
    }
  });
  document.getElementById("externalSave").onclick = function () {
    alertify.prompt("MMM-GoogleAssistant", "Save config file as:", "config", function (evt, value) {
      let fileName = value;
      if (fileName.indexOf(".") === -1) {
        fileName = `${fileName}.js`;
      } else {
        if (fileName.split(".").pop().toLowerCase() === "js") {
          // Nothing to do
        } else {
          fileName = `${fileName.split(".")[0]}.js`;
        }
      }
      var configToSave = editor.get();
      $.post("/saveExternalBackup", { data: configToSave })
        .done(function (back) {
          if (back.error) {
            alertify.error(back.error);
          } else {
            alertify.success("Download is ready !");
            $.get(`download/${back.data}`, function (data) {
              const blob = new Blob([data], { type: "application/javascript;charset=utf-8" });
              saveAs(blob, fileName);
            });
          }
        })
        .fail(function (err) {
          alertify.error(`[readExternalBackup] Server return Error ${err.status} (${err.statusText})`);
        });
    }, function () {
      // do nothing
    });
  };
}
