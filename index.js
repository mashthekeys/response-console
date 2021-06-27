const ConsoleBuffer = require("@mashthekeys/console-buffer");

module.exports.responseConsole = responseConsole;
module.exports.responseConsole.middleware = responseConsoleMiddleware;

function responseConsole(res, console, bufferLimit = 8192, prefix = null) {
  res.console = {
    log: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
    info: (...args) => console.info(...args),
    table: (...args) => console.table(...args),
    group: (...args) => console.group(...args),
    groupEnd: Ø => console.groupEnd(),
    flush: undefined
  };

  const buffer = new ConsoleBuffer(res.console, bufferLimit, prefix);

  const endBuffering = () => {
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

function responseConsoleMiddleware(console) {
  return function (req, res, next) {
    responseConsole(res, console)
      .log(`${req.method} ${req.url}\n${JSON.stringify(req.body)}`);

    next();
  }
}
