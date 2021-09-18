const ConsoleBuffer = require("@mashthekeys/console-buffer");

module.exports = responseConsole;
module.exports.default = responseConsole;
module.exports.responseConsole = responseConsole;
module.exports.middleware = responseConsoleMiddleware;

function responseConsole(res, console, bufferLimit = 10240, prefix = null) {
  const buffer = new ConsoleBuffer(console, bufferLimit, prefix);

  const destroy = function () {
    buffer.flush();

    // All future writes will be flushed
    buffer._limit = -1;

    // Remove the process.exit listener from buffer
    buffer._processExitListener && process.off('exit', buffer._processExitListener);

    buffer._processExitListener = null;

    // Disconnect the buffer from the response
    res.console = console;
  };

  res.console = buffer;

  buffer.destroy = destroy;

  res.on('finish', destroy);

  return res.console;
}

function responseConsoleMiddleware(console, bufferLimit = 10240, prefix = null) {
  return function (req, res, next) {
    responseConsole(res, console, bufferLimit, prefix)
      .log(req.method + " " + req.url + "\n" + JSON.stringify(req.body, null, 2));

    next();
  }
}
