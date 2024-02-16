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
    case "/Terminal":
      doTerminalLogs();
      break;
    case "/ptyProcess":
      doTerminal();
      break;
  }

  doTranslateNavBar();
});

async function doTerminalLogs () {
  $(document).prop("title", translation.Terminal);
  $("#TerminalHeader").text(translation.Terminal);
  $("#openTerminal").text(translation.TerminalOpen);
  var socketLogs = io();
  const termLogs = new Terminal({ cursorBlink: true });
  const fitAddonLogs = new FitAddon.FitAddon();
  termLogs.loadAddon(fitAddonLogs);
  termLogs.open(document.getElementById("terminal"));
  fitAddonLogs.fit();

  socketLogs.on("connect", () => {
    termLogs.write(`\x1B[1;3;31mMMM-GoogleAssistant v${versionGW.v} (${versionGW.rev}.${versionGW.lang})\x1B[0m \r\n\n`);
  });

  socketLogs.on("disconnect", () => {
    termLogs.write("\r\n\n\x1B[1;3;31mDisconnected\x1B[0m\r\n");
  });

  socketLogs.on("terminal.logs", function (data) {
    termLogs.write(data);
  });

  socketLogs.io.on("error", (data) => {
    console.log("Socket Error:", data);
    socketLogs.close();
  });
}

async function doTerminal () {
  $(document).prop("title", translation.Terminal);
  $("#PTYHeader").text(translation.TerminalGW);
  var socketPTY = io();
  const termPTY = new Terminal({ cursorBlink: true });
  const fitAddonPTY = new FitAddon.FitAddon();
  termPTY.loadAddon(fitAddonPTY);
  termPTY.open(document.getElementById("terminal"));
  fitAddonPTY.fit();
  if (termPTY.rows && termPTY.cols) {
    socketPTY.emit("terminal.size", { cols: termPTY.cols, rows: termPTY.rows });
  }

  socketPTY.on("connect", () => {
    termPTY.write(`\x1B[1;3;31mMMM-GoogleAssistant v${versionGW.v} (${versionGW.rev}.${versionGW.lang})\x1B[0m \r\n\n`);
  });

  socketPTY.on("disconnect", () => {
    termPTY.write("\r\n\n\x1B[1;3;31mDisconnected\x1B[0m\r\n");
  });

  termPTY.onData((data) => {
    socketPTY.emit("terminal.toTerm", data);
  });

  socketPTY.on("terminal.incData", function (data) {
    termPTY.write(data);
  });

  socketPTY.io.on("error", (data) => {
    console.log("Socket Error:", data);
    socketPTY.close();
  });
}
