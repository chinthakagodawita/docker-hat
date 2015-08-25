/**
 * @file
 * Environment initialisation library.
 */
'use strict';

var
  shell,
  Config,
  libUtils,
  libDinghy;

shell = require('shelljs');

Config = require('../config');
libUtils = require('../utils');
libDinghy = require('../dinghy');

exports.init = function (force) {
  var
    version,
    globalConfig,
    versionParts;

  globalConfig = new Config(Config.TYPE_GLOBAL);

  // Make sure we don't run this twice.
  if (globalConfig.checkInit() && !force) {
    throw new Error("Init has already been run. Use '--force' to force a reinit.");
  }

  if (force) {
    libUtils.logger.warn('This will delete any Docker images and containers you may have.');

    if (!libUtils.common.confirm('Continue? (Y/n): ')) {
      throw new Error('Cancelled by user');
    }
  }

  // Setup dinghy.
  libDinghy.init();

  // Prevent multiple initialisation.
  globalConfig.setInit();
};
