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
Config.FILE_DEFAULT = 'config.json';
Config.FILE_PHP = 'php_overrides.json';

Config.prototype._getBasePath = function () {
  // Defined base path trumps all others.
  if (this._basePath !== null) {
    return this._basePath;
  }

  switch (this._type) {
    case Config.TYPE_GLOBAL:
      // Global config is stored in the user's home directory.
      return libUtils.common.getHomeDir();
      break;

    case Config.TYPE_LOCAL:
      // Local config is stored in the current path.
      return path.resolve(process.cwd());
      break;

    default:
      throw new Error('Unknown config type: ' + this._type + '.')
      break;
  }
};

Config.prototype.getDir = function () {
  var
    configDir;

  configDir = path.resolve(this._getBasePath(), Config.DIR_NAME);

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

Config.prototype.checkInit = function (log, initCmd) {
  var
    initFlagPath;

  if (typeof log === 'undefined') {
    log = false;
  }
  else if (typeof initCmd === 'undefined') {
    throw new Error('Missing parameter "initCmd" with initialisation command name.');
  }

  initFlagPath = path.resolve(this.getDir(), Config.INIT_FLAG);

  if (fs.existsSync(initFlagPath)) {
    return true;
  }

  if (log) {
    libUtils.logger.error("It looks like you haven't run `" + initCmd + "` yet.");
    libUtils.logger.error("Please run `" + initCmd + "` before running any other commands.");
  }

  return false;
};

Config.prototype.setInit = function () {
  var
    date,
    initFlagPath;

  date = new Date();
  initFlagPath = path.resolve(this.getDir(), Config.INIT_FLAG);

  try {
    fs.writeFileSync(initFlagPath, date.toString());
  }
  catch (e) {
    libUtils.logger.error('Could not write init flag, please check permissions on the config directory (~/' + this.DIR_NAME + ') and try running `init` again.')
  }
};

Config.prototype.getConfig = function (file) {
  var
    filePath,
    fileContents;

  if (typeof file === 'undefined') {
    file = Config.FILE_DEFAULT;
  }

  filePath = path.resolve(this.getDir(), file);

  try {
    fileContents = fs.readFileSync(filePath, {
      encoding: 'utf8'
    });
  }
  catch (e) {
    // Empty config.
    libUtils.logger.debug('Could not read config from file: ' + filePath + '.');
    libUtils.logger.debug('Error was: ' + e.message);
    return {};
  }

  return JSON.parse(fileContents);
}

Config.prototype.setConfig = function (file, data) {
  var
    filePath,
    fileContents;

  if (typeof file === 'undefined') {
    file = Config.FILE_DEFAULT;
  }

  filePath = path.resolve(this.getDir(), file);

  // Don't catch exceptions, they should stop execution.
  fileContents = fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = Config;
