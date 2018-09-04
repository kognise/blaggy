var ora = require("ora");
var prompts = require("prompts");

var checkExistsSpinner = ora("Checking if config.js already exists");
var checkExistsPromise = new Promise(function(resolve, reject) {
  checkExistsSpinner.start();
  setTimeout(resolve, 1000);
}).then(
  () => {
    checkExistsSpinner.succeed();
    configDoesNotExist();
  },
  () => {
    checkExistsSpinner.fail();
  }
);

function configDoesNotExist() {
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
   
  prompts(normalQuestions).then(
    (output) => {
      normalResponse = output;
      disqusResponse = null;
      prompts({
        type: "confirm",
        name: "yorn",
        message: "Use Disqus"
      }).then(
        (output) => {
          if (output.yorn) {
            console.log("Make sure to set up your site at https://disqus.com before continuing!");
            prompts(disqusQuestions).then(
              (output) => {
                disqusResponse = output;
              },
              () => {}
            );
          }
        },
        () => {}
      );
    },
    () => {}
  );
}