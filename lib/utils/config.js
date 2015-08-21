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

exports.CONFIG_DIR_NAME = '.dh';
exports.INIT_FLAG = '.init_complete';
exports.CONFIG_TYPE_LOCAL = 1;
exports.CONFIG_TYPE_GLOBAL = 1;

exports.getBasePath = function (type) {
  
};

exports.getConfigDir = function (configPath) {
  var
    configDir;

  if (typeof configPath === 'undefined') {
    configDir = path.resolve(common.getHomeDir(), this.CONFIG_DIR_NAME);
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

exports.checkInit = function (log) {
  var
    initFlagPath;

  if (typeof log === 'undefined') {
    log = false;
  }

  initFlagPath = path.resolve(this.getConfigDir(), this.INIT_FLAG);

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
  initFlagPath = path.resolve(this.getConfigDir(), this.INIT_FLAG);

  try {
    fs.writeFileSync(initFlagPath, date.toString());
  }
  catch (e) {
    logger.error('Could not write init flag, please check permissions on the config directory (~/' + common.CONFIG_DIR_NAME + ') and try running `init` again.')
  }
};
