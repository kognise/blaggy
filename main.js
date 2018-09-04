var format  = require("string-format");
var sass    = require("node-sass")    ;
var read    = require("read-file")    ;
var express = require("express")      ;
var chalk   = require("chalk")        ;
var ora     = require("ora")          ;

try {
  var config = require("./config/config");
} catch(error) {
  console.log(chalk.red("Could not load config.js. Have you done `npm run setup` yet?"));
  process.exit(1);
}

var generatedCSS = "";
var generateCSSSpinner = ora("Generating CSS");
new Promise(function(resolve, reject) {
  generateCSSSpinner.start();
  try {
    generatedCSS = sass.renderSync({ file: "styles/main.css" }).css.toString("utf8");
    resolve();
  } catch(error) {
    reject();
  }
}).then(
  () => {
    generateCSSSpinner.succeed();
    setUpTemplates();
  },
  () => {
    generateCSSSpinner.fail();
    process.exit(1);
  }
);

var skeletonWithStuff = "";
function setUpTemplates() {
  var setUpTemplatesSpinner = ora("Setting up templates");
  new Promise(function(resolve, reject) {
    setUpTemplatesSpinner.start();
    try {
      format.extend(String.prototype, {});
      
      var skeleton = read.sync("htm/skeleton.htm");
      var head     = read.sync("htm/head.htm"    );
      var bar      = read.sync("htm/bar.htm"     );
      
      var headWithName = head.format(config.normal.name);
      var barWithName  = head.format(config.normal.name);
      
      skeletonWithStuff = skeleton.format(headWithName, barWithName, "{}");
      
      resolve();
    } catch(error) {
      reject();
    }
  }).then(
    () => {
      setUpTemplatesSpinner.succeed();
      setUpTemplates();
    },
    () => {
      setUpTemplatesSpinner.fail();
      process.exit(1);
    }
  );
}

function getHTML(contents) {
  return skeletonWithStuff.format(contents);
}

function startTheSite() {
  var app = express();

  app.get("/", function (req, res) {
    res.status(200).send("ok");
  });

  app.get("/stylesheet.css", function (req, res) {
    res.status(200).send(generatedCSS);
  });

  var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log("Listening at port %s.", port);
  });
}