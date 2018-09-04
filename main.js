var templater = require("./templater");
var sass      = require("node-sass")  ;
var read      = require("read-file")  ;
var chokidar  = require("chokidar")   ;
var express   = require("express")    ;
var spin      = require("./spin")     ;
var chalk     = require("chalk")      ;

try {
  var config = require("./config/config");
} catch(error) {
  console.log(chalk.red("Could not load config.js. Have you done `npm run setup` yet?"));
  process.exit(1);
}

var baseTemplate = "";
function setUpTemplates(callback, argument) {
  spin("Setting up templates", function() {
    var skeleton = read.sync("htm/skeleton.htm").toString("utf8");
    var head     = read.sync("htm/head.htm"    ).toString("utf8");
    var bar      = read.sync("htm/bar.htm"     ).toString("utf8");
    
    baseTemplate = templater(skeleton, ["head", "bar", "name"], [head, bar, config.normal.name]);
      
    return argument;
  }, callback);
}

var generatedCSS = "";
function generateCSS(callback, argument) {
  spin("Generating CSS", function() {
    generatedCSS = sass.renderSync({ file: "styles/main.scss" }).css.toString("utf8");
    return argument;
  }, callback, true);
}

var currentServer;

function getHTML(content) {
  return templater(baseTemplate, ["content", "styles"], [content, generatedCSS]);
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

async function startServer(app) {
  var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log(chalk.green("Listening at port %s."), port);
  });
  currentServer = server
}

function defineRoutes(app) {
  app.get("/", function (req, res) {
    res.status(200).send(getHTML("Ok."));
  });
  app.get("/test", function(req, res) {
    res.status(200).send(getHTML(read.sync("htm/test.htm")));
  })
}

setUpTemplates(generateCSS, startTheSite);