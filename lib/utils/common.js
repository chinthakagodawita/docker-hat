'use strict';

var
  fs,
  tmp,
  path,
  shell,
  logger,
  readline,
  spawnSync,
  initFlagName;

fs = require('fs');
tmp = require('tmp');
path = require('path');
shell = require('shelljs');
readline = require('readline-sync');
spawnSync = require('child_process').spawnSync;

logger = require('./logger.js');

// Clean temp on exception.
tmp.setGracefulCleanup();

exports.checkRequirements = function () {
  var
    required,
    requirement;

  required = {
    'VBoxManage': "VirtualBox doesn't appear to be installed. Please see https://www.virtualbox.org/wiki/Downloads for installation instructions.",
    'brew': "Homebrew doesn't appear to be installed. Please see http://brew.sh/ for installation instructions.",
    'dinghy': "dinghy is not installed. Please see https://github.com/chinthakagodawita/homebrew-dh for more info."
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
    name,
    subArgv,
    sources;

  subArgv = yargs.reset()
  .usage('dh soe ' + cmd + ' <container name> [options]')
  .option('sources', {
    alias: 's',
    default: '.',
    description: 'Directory to use for sources'
  })
  .boolean('skip-host')
  .option('skip-host', {
    alias: 'k',
    description: "Skip check that makes sure the Docker host is running, use if you're manually managing your host",
    default: false
  })
  .boolean('skip-pull')
  .option('skip-pull', {
    alias: 'p',
    description: "Skip pull of image from Docker Hub, useful if you're using a locally-built image.",
    default: false
  })
  .option('dns', {
    description: "Explicitly define the dnsdock nameserver IP instead of figuring it out via dinghy."
  })
  .option('hostip', {
    alias: 'i',
    description: "Explicitly define the host IP instead of figuring it out via dinghy."
  })
  .help('help')
  .argv;

  if (!subArgv._[1]) {
    name = null;
  }
  else {
    name = subArgv._[1];
  }

  sources = subArgv.sources;
  if (sources == ".") {
    sources = shell.pwd();
  }

  return {
    'name': name,
    'sources': sources,
    'dns': subArgv.dns,
    'hostIp': subArgv.hostip,
    'skipHost': subArgv.skipHost,
    'skipPull': subArgv.skipPull
  };
};

exports.runSubscript = function (scriptname, yargs) {
  var
    args,
    scriptPath;

  // Pass all other arguments to sub-script.
  args = yargs.argv._.slice(1);

  // Pass help in as the first flag if set.
  if (yargs.argv.help || yargs.argv.h) {
    args = ['--help'].concat(args);

    if (yargs.argv.help) {
      delete yargs.argv.help;
    }
    if (yargs.argv.h) {
      delete yargs.argv.h;
    }
  }

  // Pass all other valid flags through to the sub-script too.
  for (var flag in yargs.argv) {
    var flagType = '-';
    if (flag.indexOf('$') > -1 || flag == '_' || flag == 'h' || flag == 'help') {
      continue;
    }

    if (flag.length > 1) {
      flagType = '--';
    }
    args.push(flagType + flag + '=' + yargs.argv[flag]);
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

exports.writeTempFile = function (data) {
  var
    tempFile;

  tempFile = tmp.tmpNameSync();
  fs.writeFileSync(tempFile, data);
  return tempFile;
}

exports.getMacVersion = function () {
  var
    out,
    version,
    versionParts;

  out = this.shell('sw_vers', ['-productVersion'], {
    silent: true
  });

  if (out.code !== 0) {
    throw new Error('Could not determine OS X version.');
  }

  versionParts = out.output.trim().match(/([0-9]+).([0-9]+).([0-9]+)/);
  version = [
    parseInt(versionParts[1], 10),
    parseInt(versionParts[2], 10)
  ];
  if (versionParts[3])  {
    version.push(parseInt(versionParts[3], 10));
  }

  return version;
};
