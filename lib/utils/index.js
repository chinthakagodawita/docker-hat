'use strict';

var
  fs,
  path,
  shell,
  initFlag;

fs = require('fs');
path = require('path');
shell = require('shelljs');
initFlag = path.resolve('~', '.dh_init_complete');

exports.checkRequirements = function () {
  var
    required,
    requirement;

  required = {
    'VBoxManage': "VirtualBox doesn't appear to be installed. Please see https://www.virtualbox.org/wiki/Downloads for installation instructions.\nVirtualbox >= 5.0 is not supported at this time.",
    'brew': "Homebrew doesn't appear to be installed. Please see http://brew.sh/ for installation instructions."
  };

  // Make sure we have each requirement.
  for (requirement in required) {
    if (shell.which(requirement) === null) {
      throw new Error(required[requirement]);
    }
  }
};

exports.checkInit = function () {
  if (fs.existsSync(initFlag)) {
    return true;
  }
  return false;
};

exports.setInit = function () {
  // @TODO: write to initFlag with current date/time.
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
