/**
 * @file
 * Config class to load/create config files.
 */

'use strict';

var
  fs,
  path,
  libUtils;

fs = require('fs');
path = require('path');

libUtils = require('../utils');

function Config(type, basePath) {
  this._type = type;

  this._basePath = null;
  if (typeof basePath !== 'undefined') {
    this._basePath = basePath;
  }
};

Config.TYPE_LOCAL = 1;
Config.TYPE_GLOBAL = 2;
Config.DIR_NAME = '.dh';
Config.INIT_FLAG = '.init_complete';

Config.prototype._getBasePath = function () {
  // Defined base path trumps all others.
  if (this._basePath !== null) {
    return this._basePath;
  }

  console.log(this);

  switch (this._type) {
    case this.TYPE_GLOBAL:
      // Global config is stored in the user's home directory.
      return libUtils.common.getHomeDir();
      break;

    case this.TYPE_LOCAL:
      // Local config is stored in the current path.
      return path.resolve(__dirname);
      break;

    default:
      throw new Error('Unknown config type: ' + this._type + '.')
      break;
  }
};

Config.prototype.getDir = function () {
  var
    configDir;

  configDir = path.resolve(this._getBasePath(), this.DIR_NAME);

  try {
    fs.mkdirSync(configDir);
  }
  catch (e) {
    if (e.code != 'EEXIST') {
      throw e;
    }
  }

  return configDir;
};

Config.prototype.checkInit = function (log) {
  var
    initFlagPath;

  if (typeof log === 'undefined') {
    log = false;
  }

  initFlagPath = path.resolve(this.getDir(), this.INIT_FLAG);

  if (fs.existsSync(initFlagPath)) {
    return true;
  }

  if (log) {
    libUtils.logger.error("It looks like you haven't run `init` yet.");
    libUtils.logger.error("Please run `dh init` before running any other commands.");
  }

  return false;
};

Config.prototype.setInit = function () {
  var
    date,
    initFlagPath;

  date = new Date();
  initFlagPath = path.resolve(this.getDir(), this.INIT_FLAG);

  try {
    fs.writeFileSync(initFlagPath, date.toString());
  }
  catch (e) {
    libUtils.logger.error('Could not write init flag, please check permissions on the config directory (~/' + this.DIR_NAME + ') and try running `init` again.')
  }
};

module.exports = Config;
