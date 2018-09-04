var fileExists = require("file-exists");
var prompts    = require("prompts")    ;
var spin       = require("../spin")    ;
var writeFile  = require("write")      ;

spin("Checking if config.js already exists", function() {
  if (!fileExists.sync("config/config.js")) {
    return false;
  } else {
    return true;
  }
}, function(shouldExit) {
  if (shouldExit) {
    console.log("Exiting because it does.");
    process.exit();
  }
  configDoesNotExist();
});

async function configDoesNotExist() {
  var normalQuestions = [
    {
      type: "text",
      name: "author",
      message: "Your name",
      initial: "He Who Shall Not Be Named"
    },
    {
      type: "text",
      name: "name",
      message: "Blag name",
      initial: "My Big Interblag"
    },
    {
      type: "password",
      name: "password",
      message: "Admin password",
      initial: "12345"
    }
  ];

  var disqusQuestions = [
    {
      type: "text",
      name: "name",
      message: "Disqus shortname",
      initial: "myblag"
    }
  ];
  
  var normalResponse;
  var disqusResponse;
   
  normalResponse = await prompts(normalQuestions);
  disqusResponse = null;
  
  var shouldAskDisqusQuestions = await prompts({
    type: "confirm",
    name: "yorn",
    message: "Use Disqus"
  });
  if (shouldAskDisqusQuestions.yorn) {
    console.log("Make sure to set up your site at https://disqus.com before continuing!");
    disqusResponse = await prompts(disqusQuestions);
  }
  
  spin("Writing config file", function() {
    writeFile.sync("config/config.js", "var normal = "
    + JSON.stringify(normalResponse)
    + ";\nvar disqus = "
    + JSON.stringify(disqusResponse)
    + ";\nmodule.exports = {\"normal\":normal,\"disqus\":disqus};");
  }, function() {
    console.log("Blaggy is ready!");
    console.log("Just do `npm start` to start it.");
  });
}