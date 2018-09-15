var templater = require("./templater");
var sass      = require("node-sass")  ;
var read      = require("read-file")  ;
var spin      = require("./spin")     ;
var chalk     = require("chalk")      ;

var currentServer;

// Does the initial setup of templates
exports.setUpTemplates = function setUpTemplates(callback, argument, config) {
  spin("Setting up templates", function() {
    var skeleton = read.sync("htm/skeleton.htm").toString("utf8");
    var head     = read.sync("htm/head.htm"    ).toString("utf8");
    var bar      = read.sync("htm/bar.htm"     ).toString("utf8");
    var comments = read.sync("htm/comments.htm").toString("utf8");

    var config = loadConfig();
    baseTemplate = templater(skeleton, ["head", "bar", "comments", "name", ], [head, bar, comments, config.normal.name]);

    return argument;
  }, callback);
};

// Puts the content and CSS into a working HTML page
function getHTML(content, article=false) {
  var config = loadConfig();
  var enableComments = article && (config.disqus != undefined);
  return templater(baseTemplate, ["content", "enable-comments", "styles"], [content, enableComments, generatedCSS]);
}

// Generates CSS from SCSS files.
var generatedCSS = "";
exports.generateCSS = function generateCSS(callback, argument) {
  spin("Generating CSS", function() {
    generatedCSS = sass.renderSync({ file: "styles/main.scss" }).css.toString("utf8");
    return argument;
  }, callback, true);
}

// Listens on port 3000
exports.startServer = async function startServer(app) {
  var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log(chalk.green("Listening at port %s."), port);
  });
  currentServer = server
}

// Stop the server
exports.stopServer = function stopServer(app) {
  if (currentServer) {
    console.log(chalk.green("Server stopped successfully."));
    currentServer.close();
  }
};

// Sets up the correct routes.
exports.defineRoutes = function defineRoutes(app) {
  app.get("/", function (req, res) {
    res.status(200).send(getHTML("Ok.", true));
  });
  app.get("/test", function(req, res) {
    res.status(200).send(getHTML(read.sync("htm/test.htm"), true));
  });
};

// Import config, or if it fails display an error.
function loadConfig() {
  try {
    return require("./config/config");
  } catch(error) {
    console.log(chalk.red("Could not load config.js. Have you done `npm run setup` yet?"));
    process.exit(1);
  }
};
