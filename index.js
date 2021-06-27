const ConsoleBuffer = require("@mashthekeys/console-buffer");

module.exports.responseConsole = responseConsole;
module.exports.responseConsole.middleware = responseConsoleMiddleware;

function responseConsole(res, console, bufferLimit = 8192, prefix = null) {
  res.console = {
    log() { console.log.apply(console, arguments) },
    warn() { console.warn.apply(console, arguments) },
    error() { console.error.apply(console, arguments) },
    info() { console.info.apply(console, arguments) },
    table() { console.table.apply(console, arguments) },
    group() { console.group.apply(console, arguments) },
    groupEnd() { console.groupEnd.call(console) },
    flush: undefined
  };

  const buffer = new ConsoleBuffer(res.console, bufferLimit, prefix);

  const endBuffering = function () {
    buffer.flush();

    // All future writes will be flushed
    buffer.limit = -1;

    // Remove the process.exit listener from buffer
    buffer.processExitListener && process.off('exit', buffer.processExitListener);

    buffer.processExitListener = null;

    // Disconnect the buffer from the response
    res.console = console;
  };

  res.console.flush = endBuffering;

  res.on('finish', endBuffering);

  return res.console;
}

function responseConsoleMiddleware(console, bufferLimit = 8192, prefix = null) {
  return function (req, res, next) {
    responseConsole(res, console, bufferLimit, prefix)
      .log(req.method + " " + req.url + "\n" + JSON.stringify(req.body));

    next();
  }
}
