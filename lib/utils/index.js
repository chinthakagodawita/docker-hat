'use strict';

var
  shell;

shell = require('shelljs');

exports.checkRequirements = function () {
  var
    required,
    requirement;

  required = {
    'brew': "Homebrew doesn't appear to be installed. Please see @link for installation instructions.",
    'boot2docker': "Boot2Docker is not installed, please run `dh init` to install.",
    'boot2docker2': "Boot2Docker is not installed, please run `dh init` to install."
  };

  // Make sure we have each requirement.
  for (requirement in required) {
    if (shell.which(requirement) === null) {
      throw new Error(required[requirement]);
    }
  }
};

exports.runSubscript = function (scriptname, yargs) {
  var
    args;

  // Pass all other arguments to sub-script.
  args = yargs.argv._.slice(1).join(' ');

  // Pass the help flag through if it exists too.
  if (yargs.argv.help || yargs.argv.h) {
    args = '--help ' + args;
  }

  console.log("execing: " + shell.pwd() + '/bin/' + scriptname + '.js ' + args);
  shell.exec(shell.pwd() + '/bin/' + scriptname + '.js ' + args);
}
