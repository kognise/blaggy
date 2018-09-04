var express = require("express");
var sass = require("node-sass");
var ora = require("ora");

var serverExport;

var generatedCSS = "";
var generateCSSSpinner = ora("Generating CSS");
var generateCSSPromise = new Promise(function(resolve, reject) {
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
    startTheSite();
  },
  () => {
    generateCSSSpinner.fail();
    process.exit(1);
  }
);

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

  serverExport = server;
}

module.exports = serverExport;