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

  // There is a chance we'll be install things via Homebrew, update repo status.
  libUtils.logger.info('Updating Homebrew repository.');
  libUtils.common.shell('brew', ['update']);

  // Install brew cask if required.
  if (shell.which('brew-cask') === null) {
    libUtils.logger.info("You don't appear to have Homebrew Cask, installing now.");
    libUtils.common.shell('brew', [
      'install',
      'caskroom/cask/brew-cask'
    ]);
  }

  // Install vagrant if required.
  if (shell.which('vagrant') === null) {
    libUtils.logger.info("You don't appear to have Vagrant, installing now.");
    libUtils.common.shell('brew', [
      'cask',
      'update'
    ]);
    libUtils.common.shell('brew', [
      'cask',
      'install',
      'vagrant'
    ]);
  }

  // Setup dinghy.
  libDinghy.init();

  // Prevent multiple initialisation.
  globalConfig.setInit();
};
