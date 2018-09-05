var reload    = require("require-reload")(require);
var chokidar  = require("chokidar");
var express   = require("express") ;
var chalk     = require("chalk")   ;

var server = reload("./server");
var app    = express();

// Import config, or if it fails display an error.
function loadConfig() {
  try {
    var config = require("./config/config");
  } catch(error) {
    console.log(chalk.red("Could not load config.js. Have you done `npm run setup` yet?"));
    process.exit(1);
  }
  return config;
}

// Starts server and watchers
function startTheSite() {
  server.defineRoutes(app);
  server.startServer(app);
}

// Set up Chokidar watchers
function startWatchers(config) {
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
    startChain(config);
  });
}

// Start the chain of functions that lead to starting the site
function startChain(config) {
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
    server.setUpTemplates(server.generateCSS, startTheSite, config);
  }
}

// Start everything
function start() {
  var config = loadConfig();
  startChain(config);
  startWatchers(config);
}

// GO!!!!
start();
