var format   = require("string-format");
var sass     = require("node-sass")    ;
var read     = require("read-file")    ;
var chokidar = require("chokidar")     ;
var express  = require("express")      ;
var spin     = require("./spin")       ;
var chalk    = require("chalk")        ;

try {
  var config = require("./config/config");
} catch(error) {
  console.log(chalk.red("Could not load config.js. Have you done `npm run setup` yet?"));
  process.exit(1);
}

var skeletonWithStuff = "";
function setUpTemplates(callback, argument) {
  spin("Setting up templates", function() {
    format.extend(String.prototype, {});
    
    var skeleton = read.sync("htm/skeleton.htm").toString("utf8");
    var head     = read.sync("htm/head.htm"    ).toString("utf8");
    var bar      = read.sync("htm/bar.htm"     ).toString("utf8");
    
    var headWithName = head.format(config.normal.name, "{}");
    var barWithName  = bar .format(config.normal.name);
    
    skeletonWithStuff = skeleton.format(headWithName, barWithName, "{}", "{}");
    return argument;
  }, callback);
}

var generatedCSS = "";
function generateCSS(callback, argument) {
  spin("Generating CSS", function() {
    generatedCSS = sass.renderSync({ file: "styles/main.scss" }).css.toString("utf8");
    return argument;
  }, callback);
}

var currentServer;

function getHTML(contents) {
  var toReturn = skeletonWithStuff.format(generatedCSS, contents);
  return toReturn;
}

function startTheSite() {
  var app = express();
  defineRoutes(app);
  startServer(app);
  chokidar.watch("styles", {ignoreInitial: true}).on("all", (event, path) => {
    console.log("SCSS change detected.");
    generateCSS(() => {});
  });
  chokidar.watch("htm", {ignoreInitial: true}).on("all", (event, path) => {
    console.log("Template change detected.");
    setUpTemplates(() => {});
  });
}

function defineRoutes(app) {
  app.get("/", function (req, res) {
    res.status(200).send(getHTML("ok"));
  });
}

async function startServer(app) {
  var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log(chalk.green("Listening at port %s."), port);
  });
  currentServer = server
}

setUpTemplates(generateCSS, startTheSite);