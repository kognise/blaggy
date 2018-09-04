var chalk = require("chalk");
var ora   = require("ora")  ;

module.exports = function(text, run, callback) {
  var spinner = ora(text);
  (new Promise(function(resolve, reject) {
    spinner.start();
    try {
      resolve(run());
    } catch(error) {
      reject(error);
    }
  })).then(
    (argument) => {
      spinner.succeed();
      callback(argument);
    },
    (error) => {
      spinner.fail();
      console.log(chalk.red(error));
      process.exit(1);
    }
  );
}