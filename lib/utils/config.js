/**
 * @file
 * Config utility helpers.
 */

'use strict';

var
  fs,
  path,
  logger,
  common;

fs = require('fs');
path = require('path');
logger = require('./logger.js');
common = require('./common.js');

exports.INIT_FLAG = '.init_complete';

exports.getConfigDir = function (configPath) {
  var
    configDir;

  if (typeof configPath === 'undefined') {
    configDir = path.resolve(common.getHomeDir(), common.CONFIG_DIR_NAME);
  }
  else {
    configDir = configPath;
  }

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

exports.checkInit = function (log, initPath) {
  var
    initFlagPath;

  if (typeof log === 'undefined') {
    log = false;
  }

  if (typeof initPath === 'undefined') {
    initFlagPath = path.resolve(this.getConfigDir(), this.INIT_FLAG);
  }
  else {
    initFlagPath = initPath;
  }

  if (fs.existsSync(initFlagPath)) {
    return true;
  }

  if (log) {
    logger.error("It looks like you haven't run `init` yet.");
    logger.error("Please run `dh init` before running any other commands.");
  }

  return false;
};

exports.setInit = function (initPath) {
  var
    date,
    initFlagPath;

  date = new Date();
  if (typeof initPath === 'undefined') {
    initFlagPath = path.resolve(this.getConfigDir(), this.INIT_FLAG);
  }
  else {
    initFlagPath = initPath;
  }

  try {
    fs.writeFileSync(initFlagPath, date.toString());
  }
  catch (e) {
    logger.error('Could not write init flag, please check permissions on the config directory (~/' + common.CONFIG_DIR_NAME + ') and try running `init` again.')
  }
};
