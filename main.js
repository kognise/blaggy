var reload    = require("require-reload")(require);
var chokidar  = require("chokidar");
var express   = require("express") ;
var chalk     = require("chalk")   ;

var server = reload("./server");
var app    = express();

// Starts server and watchers
function startTheSite() {
  server.defineRoutes(app);
  server.startServer(app);
}

// Set up Chokidar watchers
function startWatchers() {
  chokidar.watch("styles", {ignoreInitial: true}).on("all", (event, path) => {
    console.log(chalk.bold("SCSS change detected."));
    server.generateCSS(() => {});
  });
  chokidar.watch("htm", {ignoreInitial: true}).on("all", (event, path) => {
    console.log(chalk.bold("Template change detected."));
    server.setUpTemplates(() => {});
  });
  chokidar.watch("server.js", {ignoreInitial: true}).on("all", (event, path) => {
    console.log(chalk.bold("Server script change detected."));
    startChain();
  });
}

// Start the chain of functions that lead to starting the site
function startChain() {
  var oldServer = server;
  try {
    server = reload("./server");
    var success = true;
  } catch(error) {
    console.log(chalk.red("Error in server.js: %s"), error.message);
    console.log(chalk.red("The current instance will be kept."))
    var success = false;
  }
  if (success) {
    oldServer.stopServer();
    server.setUpTemplates(server.generateCSS, startTheSite);
  }
}

// Start everything
function start() {
  startChain();
  startWatchers();
}

// GO!!!!
start();
