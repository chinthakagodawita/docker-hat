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

exports.DIR_NAME = '.dh';
exports.INIT_FLAG = '.init_complete';
exports.TYPE_LOCAL = 1;
exports.TYPE_GLOBAL = 1;

exports.getBasePath = function (type) {
  switch (type) {
    case this.TYPE_GLOBAL:
      // Global config is stored in the user's home directory.
      return common.getHomeDir();
      break;

    case this.TYPE_LOCAL:
      return path.resolve(__dirname);
      break;

    default:
      console.trace();
      throw new Error('Unknown config type: ' + type + '.')
      break;
  }
};

exports.getConfigDir = function (type) {
  var
    configDir;

  configDir = path.resolve(this.getBasePath(type), this.DIR_NAME);

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

exports.checkInit = function (type, log) {
  var
    initFlagPath;

  if (typeof log === 'undefined') {
    log = false;
  }

  initFlagPath = path.resolve(this.getConfigDir(type), this.INIT_FLAG);

  if (fs.existsSync(initFlagPath)) {
    return true;
  }

  if (log) {
    logger.error("It looks like you haven't run `init` yet.");
    logger.error("Please run `dh init` before running any other commands.");
  }

  return false;
};

exports.setInit = function (type) {
  var
    date,
    initFlagPath;

  date = new Date();
  initFlagPath = path.resolve(this.getConfigDir(type), this.INIT_FLAG);

  try {
    fs.writeFileSync(initFlagPath, date.toString());
  }
  catch (e) {
    logger.error('Could not write init flag, please check permissions on the config directory (~/' + common.DIR_NAME + ') and try running `init` again.')
  }
};
