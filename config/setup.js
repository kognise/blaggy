var ora        = require("ora")        ;
var prompts    = require("prompts")    ;
var fileExists = require("file-exists");
var writeFile  = require("write")      ;

var checkExistsSpinner = ora("Checking if config.js already exists");
new Promise(function(resolve, reject) {
  checkExistsSpinner.start();
  if (!fileExists.sync("config/config.js")) {
    resolve(false);
  } else {
    resolve(true);
  }
}).then(
  (shouldExit) => {
    checkExistsSpinner.succeed();
    if (shouldExit) {
      console.log("Exiting because it does.");
      process.exit();
    }
    configDoesNotExist();
  },
  () => {
    checkExistsSpinner.fail();
    process.exit(1);
  }
);

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
  
  var writeFileSpinner = ora("Writing config file");
  new Promise(function(resolve, reject) {
    writeFileSpinner.start();
    writeFile("config/config.js", "var normal = "
    + JSON.stringify(normalResponse) + ";\nvar disqus = " + JSON.stringify(disqusResponse)
    + ";\nmodule.exports = {\"normal\":normal,\"disqus\":disqus};", (error) => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    });
  }).then(
    () => {
      writeFileSpinner.succeed();
      console.log("Blaggy is ready!");
      console.log("Just do `npm start` to start it.");
    },
    () => {
      writeFileSpinner.fail();
      process.exit(1);
    }
  );
}