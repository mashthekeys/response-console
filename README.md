# @mashthekeys/response-console

[![NPM](https://nodei.co/npm/@mashthekeys/response-console.png)](https://nodei.co/npm/@mashthekeys/response-console/)

Creates a buffered console object on a Response object, which outputs to its 
parent console when the response finishes. Comes with middleware for server 
logging by request. 

Intended to help logs remain coherent in high-concurrency applications, 
where asynchronous processes to load files or query databases can otherwise 
result in jumbled logs.

## Examples
### Basic usage
```javascript
const responseConsole = require("@mashthekeys/response-console");

createServer(function (req, res) {
  responseConsole(res, console)

  console.log("This output appears immediately.")

  res.console.log("This will only output to console when the response is finished.")

  someAsyncProcess(req, res)
    .then(data => {
      res.console.log("Process completed, response is about to finish.")

      res.end(data)
    })
});
```

### Outputting to a custom console
```javascript
const responseConsole = require("@mashthekeys/response-console");

const logger = require("some-package")();

createServer(function(req, res) {
  responseConsole(res, logger)
  
  res.console.log("This will be appended to the log when the response is finished.")

  logger.log("This log message appears immediately.")
  
  someAsyncProcess().then(data => res.end(data))
});
```

### Log every request to console
```javascript
const app = require("express")();
const responseConsole = require("@mashthekeys/response-console");

app.all("*", responseConsole.middleware(console))
```

