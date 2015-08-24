'use strict';

var
  fs,
  path,
  shell,
  logger,
  readline,
  spawnSync,
  initFlagName;

fs = require('fs');
path = require('path');
shell = require('shelljs');
readline = require('readline-sync');
spawnSync = require('child_process').spawnSync;

logger = require('./logger.js');

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
  args = yargs.argv._.slice(1);

  // Pass the help & debug flags through if it exists too.
  if (yargs.argv.help || yargs.argv.h) {
    args = ['--help'].concat(args);
  }
  if (yargs.argv.debug || yargs.argv.d) {
    args.push('-d');
  }

  scriptPath = path.resolve(__dirname, '..', '..', 'bin', scriptname + '.js');
  spawnSync(scriptPath, args, {
    cwd: process.cwd(),
    stdio: 'inherit'
  })
};

exports.shell = function (cmd, args, opts) {
  if (typeof args === 'undefined') {
    args = [];
  }
  if (typeof opts === 'undefined') {
    opts = {};
  }

  if (typeof args === 'string') {
    args = [args];
  }

  if (args) {
    cmd += ' ' + args.join(' ');
  }

  logger.debug('Executing: ' + cmd);

  // @TODO: check return code and throw Error with message if >0.
  return shell.exec(cmd, opts);
};

exports.getHomeDir = function () {
  return process.env.HOME || process.env.USERPROFILE;
};

exports.confirm = function (msg) {
  var
    confirm;

  confirm = null;

  // Prompt while we get valid output.
  while (confirm !== false && confirm !== true) {
    confirm = readline.question(msg, {
      trueValue: 'y',
      falseValue: 'n'
    });
  }

  return confirm;
};

exports.promptList = function (msg, opts) {
  var
    index;

  index = readline.keyInSelect(opts, msg);

  if (index === -1) {
    logger.error('User cancelled exection.');
    process.exit(1);
  }

  return opts[index];
};

exports.isEmptyObject = function (obj) {
  return !Object.keys(obj).length;
}
