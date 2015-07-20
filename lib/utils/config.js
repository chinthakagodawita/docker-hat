/**
 * @file
 * Config utility helpers.
 */

'use strict';

var
  fs,
  path,
  logger,
  common,
  initFlagName,
  configDirName;

fs = require('fs');
path = require('path');
logger = require('./logger.js');
common = require('./common.js');

initFlagName = '.init_complete';
configDirName = '.dh';

exports.getConfigDir = function () {
  var
    configDir;

  configDir = path.resolve(common.getHomeDir(), configDirName);

  try {
    fs.mkdirSync(configDir);
  }
  catch (e) {
    if (e.code != 'EEXIST') {
      throw e;
    }
  }

  return configDir;
}

exports.checkInit = function (log) {
  var
    initFlagPath;

  if (typeof log === 'undefined') {
    log = false;
  }

  initFlagPath = path.resolve(this.getConfigDir(), initFlagName);

  if (fs.existsSync(initFlagPath)) {
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
    date,
    initFlagPath;

  date = new Date();
  initFlagPath = path.resolve(this.getConfigDir(), initFlagName);

  try {
    fs.writeFileSync(initFlagPath, date.toString());
  }
  catch (e) {
    logger.error('Could not write init flag, please check permissions on the config directory (~/' + configDirName + ') and try running `init` again.')
  }
};
