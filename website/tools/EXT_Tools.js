/** EXT tools
* @bugsounet
**/

// rotate rules
PleaseRotateOptions = {
  startOnPageLoad: false
};

// define all vars
var translation = {};
var InstEXT = [];
var versionGW = {};
var webviewTag = false;
var EXTStatus = {};
var ErrEXTStatus = 0;

// Load rules
window.addEventListener("load", async (event) => {
  versionGW = await getGatewayVersion();
  translation = await loadTranslation();

  $("html").prop("lang", versionGW.lang);
  forceMobileRotate();
  doTools();

  doTranslateNavBar();
});

async function doTools () {
  // translate
  $(document).prop("title", translation.Tools);
  webviewTag = await checkWebviewTag();
  EXTStatus = await checkEXTStatus();

  // live stream every secs of EXT for update
  setInterval(async () => {
    EXTStatus = await checkEXTStatus();
  }, 1000);

  $("#title").text(translation.Tools_Welcome);
  $("#subtitle").text(translation.Tools_subTitle);
  $("#stop").text(translation.Tools_Die);
  $("#restart").text(translation.Tools_Restart);
  $("#Die").text(translation.Confirm);
  $("#Restart").text(translation.Confirm);

  // backups
  var allBackup = await loadBackupNames();
  if (allBackup.length > 5) {
    $("#backupFound").text(allBackup.length);
    $("#backupFoundText").text(translation.Tools_Backup_Found);
    $("#backupText").text(translation.Tools_Backup_Text);
    $("#backup-Delete").text(translation.Delete);
    $("#backup-Error").text(translation.Error);
    $("#backup-Done").text(translation.Done);
    $("#backup-Box").css("display", "block");

    document.getElementById("backup-Delete").onclick = function () {
      $.post("/deleteBackup")
        .done(function (back) {
          if (back.error) {
            $("#backup-Delete").css("display", "none");
            $("#backup-Error").css("display", "inline-block");
            alertify.error(back.error);
          } else {
            $("#backup-Delete").css("display", "none");
            $("#backup-Done").css("display", "inline-block");
            alertify.success(translation.Tools_Backup_Deleted);
            back.error;
          }
        })
        .fail(function (err) {
          alertify.error(`[Delete] Server return Error ${err.status} (${err.statusText})`);
        });
    };

    document.getElementById("backup-Done").onclick = function () {
      $("#backup-Box").css("display", "none");
    };
  }

  // webview
  if (!webviewTag) {
    $("#webviewHeader").text(translation.Tools_Webview_Header);
    $("#webviewNeeded").text(translation.Tools_Webview_Needed);
    $("#webviewbtn-Apply").text(translation.Save);
    $("#webviewbtn-Error").text(translation.Error);
    $("#webviewbtn-Done").text(translation.Done);
    if (!InstEXT.length) InstEXT = await loadDataInstalledEXT();
    var webviewNeeded = ["EXT-Browser", "EXT-Photos", "EXT-YouTube", "EXT-YouTubeCast"];
    var displayNeeded = 0;

    InstEXT.forEach((EXT) => {
      if (webviewNeeded.indexOf(EXT) > -1) displayNeeded++;
    });

    if (displayNeeded) $("#webview-Box").css("display", "block");

    document.getElementById("webviewbtn-Apply").onclick = function () {
      $.post("/setWebviewTag")
        .done(function (back) {
          if (back.error) {
            $("#webviewbtn-Apply").css("display", "none");
            $("#webviewbtn-Error").css("display", "inline-block");
            alertify.success(back.error);
          } else {
            $("#webviewbtn-Apply").css("display", "none");
            $("#webviewbtn-Done").css("display", "inline-block");
            alertify.success(translation.Restart);
          }
        })
        .fail(function (err) {
          alertify.error(`[WebviewTag] Server return Error ${err.status} (${err.statusText})`);
        });
    };

    document.getElementById("webviewbtn-Done").onclick = function () {
      $("#webview-Box").css("display", "none");
      webviewTag = true;
    };
  }

  // screen control
  if (EXTStatus["EXT-Screen"].hello) {
    if (EXTStatus["EXT-Screen"].power) $("#Screen-Control").text(translation.TurnOff);
    else $("#Screen-Control").text(translation.TurnOn);
    setInterval(() => {
      if (EXTStatus["EXT-Screen"].power) $("#Screen-Control").text(translation.TurnOff);
      else $("#Screen-Control").text(translation.TurnOn);
    }, 1000);
    $("#Screen-Text").text(translation.Tools_Screen_Text);
    $("#Screen-Box").css("display", "block");

    document.getElementById("Screen-Control").onclick = function () {
      if (EXTStatus["EXT-Screen"].power) {
        $.post("/EXT-Screen", { data: "OFF" })
          .done(function (back) {
            if (back.error) {
              alertify.error(translation.Warn_Error);
            } else {
              alertify.success(translation.RequestDone);
            }
          })
          .fail(function (err) {
            alertify.error(`[Screen] Server return Error ${err.status} (${err.statusText})`);
          });
      } else {
        $.post("/EXT-Screen", { data: "ON" })
          .done(function (back) {
            if (back == "error") {
              alertify.error(translation.Warn_Error);
            } else {
              alertify.success(translation.RequestDone);
            }
          })
          .fail(function (err) {
            alertify.error(`[Screen] Server return Error ${err.status} (${err.statusText})`);
          });
      }
    };
  }

  // EXT-Alert query
  if (EXTStatus["EXT-Alert"].hello) {
    $("#Alert-Query").prop("placeholder", translation.Tools_Alert_Query);
    $("#Alert-Text").text(translation.Tools_Alert_Text);
    $("#Alert-Send").text(translation.Send);
    $("#Alert-Box").css("display", "block");
    $("#Alert-Query").keyup(function () {
      if ($(this).val().length > 5) {
        $("#Alert-Send").removeClass("disabled");
      } else {
        $("#Alert-Send").addClass("disabled");
      }
    });

    document.getElementById("Alert-Send").onclick = function () {
      $("#Alert-Send").addClass("disabled");
      $.post("/EXT-AlertQuery", { data: $("#Alert-Query").val() })
        .done(function (back) {
          $("#Alert-Query").val("");
          if (back == "error") {
            alertify.error(translation.Warn_Error);
          } else {
            alertify.success(translation.RequestDone);
          }
        })
        .fail(function (err) {
          alertify.error(`[Alert] Server return Error ${err.status} (${err.statusText})`);
        });
    };
  }

  // Volume control
  if (EXTStatus["EXT-Volume"].hello) {
    $("#Volume-Text").text(translation.Tools_Volume_Text);
    $("#Volume-Text2").text(translation.Tools_Volume_Text2);
    $("#Volume-Text3").text(translation.Tools_Volume_Text3);
    $("#Volume-Send").text(translation.Confirm);
    $("#Volume-Box").css("display", "block");
    setInterval(() => {
      $("#Volume-Set").text(`${EXTStatus["EXT-Volume"].speaker}%`);
    }, 1000);

    document.getElementById("Volume-Send").onclick = function () {
      $.post("/EXT-VolumeSendSpeaker", { data: $("#Volume-Query").val() })
        .done(function (back) {
          if (back == "error") {
            alertify.error(translation.Warn_Error);
          } else {
            alertify.success(translation.RequestDone);
          }
        })
        .fail(function (err) {
          alertify.error(`[Volume] Server return Error ${err.status} (${err.statusText})`);
        });
    };
  }

  // mic control
  if (EXTStatus["EXT-Volume"].hello) {
    $("#Volume-Text-Record").text(translation.Tools_Volume_Text_Record);
    $("#Volume-Text-Record2").text(translation.Tools_Volume_Text2);
    $("#Volume-Text-Record3").text(translation.Tools_Volume_Text3);
    $("#Volume-Send-Record").text(translation.Confirm);
    $("#Volume-Box-Record").css("display", "block");
    setInterval(() => {
      $("#Volume-Set-Record").text(`${EXTStatus["EXT-Volume"].recorder}%`);
    }, 1000);

    document.getElementById("Volume-Send-Record").onclick = function () {
      $.post("/EXT-VolumeSendRecorder", { data: $("#Volume-Query-Record").val() })
        .done(function (back) {
          if (back == "error") {
            alertify.error(translation.Warn_Error);
          } else {
            alertify.success(translation.RequestDone);
          }
        })
        .fail(function (err) {
          alertify.error(`[Volume] Server return Error ${err.status} (${err.statusText})`);
        });
    };
  }

  // Update Control
  if (EXTStatus["EXT-Updates"].hello) {
    $("#Update-Header").text(translation.Tools_Update_Header);
    $("#Update-Text").text(translation.Tools_Update_Text);
    $("#Update-Text2").text(translation.Tools_Update_Text2);
    // only on live
    setInterval(async () => {
      let needUpdate = 0;
      $("#Update-Confirm").text(translation.Confirm);
      var updateModules = EXTStatus["EXT-Updates"].module;
      if (!updateModules) return $("#Update-Box").css("display", "none");
      if (!Object.keys(updateModules).length) return $("#Update-Box").css("display", "none");
      if (Object.keys(updateModules).length) {
        $("#Update-Box").css("display", "block");
        for (const [key, value] of Object.entries(updateModules)) {
          if ($(`#${key}`).length == 0) $("#Update-Modules-Box").append(`<br><span id='${key}'>${key}</span>`);
          if (key.startsWith("EXT-") || key == "MMM-GoogleAssistant") ++needUpdate;
        }
        $("#Update-Modules-Box").css("display", "block");
      }
      if (!needUpdate) $("#Update-Confirm").addClass("disabled");
      else $("#Update-Confirm").removeClass("disabled");
    }, 1000);
    document.getElementById("Update-Confirm").onclick = function () {
      $("#Update-Confirm").addClass("disabled");
      $.post("/EXT-Updates")
        .done(function (back) {
          if (back == "error") {
            alertify.error(translation.Warn_Error);
          } else {
            alertify.success(translation.RequestDone);
          }
        })
        .fail(function (err) {
          alertify.error(`[Updates] Server return Error ${err.status} (${err.statusText})`);
        });
    };
  }

  // Spotify Control
  if (EXTStatus["EXT-Spotify"].hello) {
    var type = null;
    setInterval(() => {
      if (EXTStatus["EXT-Spotify"].connected || (EXTStatus["EXT-Spotify"].remote && EXTStatus["EXT-Spotify"].play)) {
        $("#Spotify-Play").css("display", "none");
        $("#Spotify-Stop").css("display", "block");
      } else {
        $("#Spotify-Play").css("display", "block");
        $("#Spotify-Stop").css("display", "none");
      }
    }, 1000);
    $("#Spotify-Text").text(translation.Tools_Spotify_Text);
    $("#Spotify-Text2").text(translation.Tools_Spotify_Text2);
    $("#Spotify-Send").text(translation.Send);
    $("#Spotify-Artist-Text").text(translation.Tools_Spotify_Artist);
    $("#Spotify-Track-Text").text(translation.Tools_Spotify_Track);
    $("#Spotify-Album-Text").text(translation.Tools_Spotify_Album);
    $("#Spotify-Playlist-Text").text(translation.Tools_Spotify_Playlist);
    $("#Spotify-Query").prop("placeholder", translation.Tools_Spotify_Query);
    $("#Spotify-Send").text(translation.Send);
    $("#Spotify-Box").css("display", "block");
    $("#Spotify-Query").keyup(function () {
      if ($(this).val().length > 1 && type) {
        $("#Spotify-Send").removeClass("disabled");
      } else {
        $("#Spotify-Send").addClass("disabled");
      }
    });

    document.getElementById("Spotify-Send").onclick = function () {
      $("#Spotify-Send").addClass("disabled");
      $.post("/EXT-SpotifyQuery", {
        data: {
          query: $("#Spotify-Query").val(),
          type: type
        }
      })
        .done(function (back) {
          $("#Spotify-Query").val("");
          if (back == "error") {
            alertify.error(translation.Warn_Error);
          } else {
            alertify.success(translation.RequestDone);
          }
        })
        .fail(function (err) {
          alertify.error(`[Spotify] Server return Error ${err.status} (${err.statusText})`);
        });
    };

    document.getElementById("Spotify-Play").onclick = function () {
      $.post("/EXT-SpotifyPlay");
    };

    document.getElementById("Spotify-Stop").onclick = function () {
      $.post("/EXT-SpotifyStop");
    };

    document.getElementById("Spotify-Next").onclick = function () {
      $.post("/EXT-SpotifyNext");
    };

    document.getElementById("Spotify-Previous").onclick = function () {
      $.post("/EXT-SpotifyPrevious");
    };

    document.getElementById("Spotify-Artist").onclick = function () {
      if (!this.checked) {
        type = null;
        $("#Spotify-Send").addClass("disabled");
        return;
      }
      type = "artist";
      $("#Spotify-Track").prop("checked", !this.checked);
      $("#Spotify-Album").prop("checked", !this.checked);
      $("#Spotify-Playlist").prop("checked", !this.checked);
      if ($("#Spotify-Query").val().length > 1) {
        $("#Spotify-Send").removeClass("disabled");
      } else {
        $("#Spotify-Send").addClass("disabled");
      }
    };

    document.getElementById("Spotify-Track").onclick = function () {
      if (!this.checked) {
        type = null;
        $("#Spotify-Send").addClass("disabled");
        return;
      }
      type = "track";
      $("#Spotify-Artist").prop("checked", !this.checked);
      $("#Spotify-Album").prop("checked", !this.checked);
      $("#Spotify-Playlist").prop("checked", !this.checked);
      if ($("#Spotify-Query").val().length > 1) {
        $("#Spotify-Send").removeClass("disabled");
      } else {
        $("#Spotify-Send").addClass("disabled");
      }
    };

    document.getElementById("Spotify-Album").onclick = function () {
      if (!this.checked) {
        type = null;
        $("#Spotify-Send").addClass("disabled");
        return;
      }
      type = "album";
      $("#Spotify-Artist").prop("checked", !this.checked);
      $("#Spotify-Track").prop("checked", !this.checked);
      $("#Spotify-Playlist").prop("checked", !this.checked);
      if ($("#Spotify-Query").val().length > 1) {
        $("#Spotify-Send").removeClass("disabled");
      } else {
        $("#Spotify-Send").addClass("disabled");
      }
    };

    document.getElementById("Spotify-Playlist").onclick = function () {
      if (!this.checked) {
        type = null;
        $("#Spotify-Send").addClass("disabled");
        return;
      }
      type = "playlist";
      $("#Spotify-Artist").prop("checked", !this.checked);
      $("#Spotify-Track").prop("checked", !this.checked);
      $("#Spotify-Album").prop("checked", !this.checked);
      if ($("#Spotify-Query").val().length > 1) {
        $("#Spotify-Send").removeClass("disabled");
      } else {
        $("#Spotify-Send").addClass("disabled");
      }
    };
  }

  // GoogleAssistant Query
  $("#GoogleAssistant-Text").text(translation.Tools_GoogleAssistant_Text);
  $("#GoogleAssistant-Query").prop("placeholder", translation.Tools_GoogleAssistant_Query);
  $("#GoogleAssistant-Send").text(translation.Send);
  $("#GoogleAssistant-Box").css("display", "block");
  $("#GoogleAssistant-Query").keyup(function () {
    if ($(this).val().length > 5) {
      $("#GoogleAssistant-Send").removeClass("disabled");
    } else {
      $("#GoogleAssistant-Send").addClass("disabled");
    }
  });

  document.getElementById("GoogleAssistant-Send").onclick = function () {
    $("#GoogleAssistant-Send").addClass("disabled");
    $.post("/EXT-GAQuery", { data: $("#GoogleAssistant-Query").val() })
      .done(function (back) {
        $("#GoogleAssistant-Query").val("");
        if (back == "error") {
          alertify.error(translation.Warn_Error);
        } else {
          alertify.success(translation.RequestDone);
        }
      })
      .fail(function (err) {
        alertify.error(`[GoogleAssistant] Server return Error ${err.status} (${err.statusText})`);
      });
  };

  // YouTube Query
  if (EXTStatus["EXT-YouTube"].hello) {
    $("#YouTube-Text").text(translation.Tools_YouTube_Text);
    $("#YouTube-Query").prop("placeholder", translation.Tools_YouTube_Query);
    $("#YouTube-Send").text(translation.Send);
    $("#YouTube-Box").css("display", "block");
    $("#YouTube-Query").keyup(function () {
      if ($(this).val().length > 1) {
        $("#YouTube-Send").removeClass("disabled");
      } else {
        $("#YouTube-Send").addClass("disabled");
      }
    });

    document.getElementById("YouTube-Send").onclick = function () {
      $.post("/EXT-YouTubeQuery", { data: $("#YouTube-Query").val() })
        .done(function (back) {
          $("#YouTube-Query").val("");
          if (back == "error") {
            alertify.error(translation.Warn_Error);
          } else {
            alertify.success(translation.RequestDone);
          }
        })
        .fail(function (err) {
          alertify.error(`[YouTube] Server return Error ${err.status} (${err.statusText})`);
        });
    };
  }

  // RadioPlayer query
  if (EXTStatus["EXT-RadioPlayer"].hello) {
    $("#Radio-Text").text(translation.Tools_Radio_Text);
    $("#Radio-Send").text(translation.Listen);
    var radio = await loadRadio();
    if (radio.length) {
      radio.forEach((station) => {
        $("#Radio-Query").append($("<option>", {
          value: station,
          text: station,
          selected: false
        }));
      });
    }
    else {
      $("#Radio-Query").css("display", "none");
      $("#Radio-Text2").text(translation.Tools_Radio_Text2);
      $("#Radio-Text2").css("display", "block");
      $("#Radio-Send").addClass("disabled");
    }
    $("#Radio-Box").css("display", "block");
    document.getElementById("Radio-Send").onclick = function () {
      $.post("/EXT-RadioQuery", { data: $("#Radio-Query").val() })
        .done(function (back) {
          if (back == "error") {
            alertify.error(translation.Warn_Error);
          } else {
            alertify.success(translation.RequestDone);
          }
        })
        .fail(function (err) {
          alertify.error(`[RadioPlayer] Server return Error ${err.status} (${err.statusText})`);
        });
    };
  }

  // FreeboxTV query
  if (EXTStatus["EXT-FreeboxTV"].hello && versionGW.lang == "fr") {
    $("#FreeboxTV-Box").css("display", "block");
    document.getElementById("FreeboxTV-Send").onclick = function () {
      $.post("/EXT-FreeboxTVQuery", { data: $("#FreeboxTV-Query").val() })
        .done(function (back) {
          if (back == "error") {
            alertify.error(translation.Warn_Error);
          } else {
            alertify.success(translation.RequestDone);
          }
        })
        .fail(function (err) {
          alertify.error(`[FreeboxTV] Server return Error ${err.status} (${err.statusText})`);
        });
    };
  }

  // Stop Command
  $("#Stop-Text").text(translation.Tools_Stop_Text);
  $("#Stop-Send").text(translation.Send);
  document.getElementById("Stop-Send").onclick = function () {
    $.post("/EXT-StopQuery")
      .done(function (back) {
        if (back == "error") {
          alertify.error(translation.Warn_Error);
        } else {
          alertify.success(translation.RequestDone);
        }
      })
      .fail(function (err) {
        alertify.error(`[STOP] Server return Error ${err.status} (${err.statusText})`);
      });
  };

  setInterval(() => {
    if (this.hasPluginConnected(EXTStatus, "connected", true)) {
      $("#Stop-Box").css("display", "block");
    }
    else $("#Stop-Box").css("display", "none");
  }, 1000);
}
