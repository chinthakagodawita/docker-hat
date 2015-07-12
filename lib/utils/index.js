'use strict';

var
  path,
  shell;

path = require('path');
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

exports.getYargsContainerInfo = function (yargs, cmd) {
  var
    subArgv,
    sources;

  subArgv = yargs.usage('dh soe ' + cmd + ' <container name> [options]')
  .option('s', {
    alias: 'sources',
    description: 'Directory to use for sources, defaults to the current directory'
  })
  .help('help')
  .argv;

  if (!subArgv._[1]) {
    throw new Error('please provide a container name');
  }

  if (!subArgv.s) {
    sources = shell.pwd();
  }

  return {
    'name': subArgv._[1],
    'sources': sources
  };
};

exports.runSubscript = function (scriptname, yargs) {
  var
    args,
    scriptPath;

  // Pass all other arguments to sub-script.
  args = yargs.argv._.slice(1).join(' ');

  // Pass the help flag through if it exists too.
  if (yargs.argv.help || yargs.argv.h) {
    args = '--help ' + args;
  }

  scriptPath = path.resolve(__dirname, '..', '..', 'bin', scriptname + '.js');
  console.log("execing: " + scriptPath + ' ' + args);
  shell.exec(scriptPath + ' ' + args);
}
