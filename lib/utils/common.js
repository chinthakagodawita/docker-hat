'use strict';

var
  fs,
  path,
  shell,
  logger,
  initFlag,
  getHomeDir;

fs = require('fs');
path = require('path');
shell = require('shelljs');
logger = require('./logger.js');

getHomeDir = function () {
  return process.env.HOME || process.env.USERPROFILE;
};

initFlag = path.resolve(getHomeDir(), '.dh_init_complete');

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

exports.checkInit = function (log) {
  if (typeof log === 'undefined') {
    log = false;
  }

  if (fs.existsSync(initFlag)) {
    return true;
  }

  if (log) {
    logger.error("It looks like you haven't run `init` yet.");
    logger.error("Please run `dh init` before running any other commands.");
  }

  return false;
};

exports.setInit = function () {
  var
    date;

  date = new Date();

  fs.writeFileSync(initFlag, date.toString());
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

  // Pass the help & debug flags through if it exists too.
  if (yargs.argv.help || yargs.argv.h) {
    args = '--help ' + args;
  }
  if (yargs.argv.debug || yargs.argv.d) {
    args += ' -d';
  }

  scriptPath = path.resolve(__dirname, '..', '..', 'bin', scriptname + '.js');
  this.shell(scriptPath, args);
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

  return shell.exec(cmd, opts);
};

exports.getHomeDir = getHomeDir;
