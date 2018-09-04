var chalk = require("chalk");
var ora   = require("ora")  ;

module.exports = function(text, run, callback, recoverGracefully=false) {
  var spinner = ora(text);
  (new Promise(function(resolve, reject) {
    spinner.start();
    try {
      var value = run();
      resolve(value);
    } catch(error) {
      reject(error, value);
    }
  })).then(
    (argument) => {
      spinner.succeed();
      callback(argument);
    },
    (error, argument) => {
      spinner.fail();
      console.log(chalk.red(error));
      if (!recoverGracefully) {
        process.exit(1);
      } else {
        callback(argument);
      }
    }
  );
}