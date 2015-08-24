/**
 * @file
 * Environment initialisation library.
 */
'use strict';

var
  shell,
  Config,
  libUtils;

shell = require('shelljs');

Config = require('../config');
libUtils = require('../utils');

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

  // Install boot2docker.
  if (shell.which('boot2docker') === null) {
    libUtils.logger.info("You don't appear to have boot2docker, installing now.");
    libUtils.common.shell('brew', ['update']);
    libUtils.common.shell('brew', [
      'install',
      'boot2docker'
    ]);
  }
  else {
    // Check boot2docker version.
    version = libUtils.common.shell('boot2docker', ['version'], {
      silent: true
    });
    version = version.output.match(/^Boot2Docker-cli\sversion:\sv(\d).(\d).(\d)/);
    versionParts = [
      parseInt(version[1], 10),
      parseInt(version[2], 10)
    ];
    if (version[3]) {
      versionParts.push(parseInt(version[3], 10));
    }

    if (versionParts[0] <= 1 && versionParts[1] <= 7 && versionParts[2] < 1) {
      libUtils.logger.error("It looks like you're using a version of boot2docker older than v1.7.1. Please upgrade boot2docker to at least v1.7.1 before continuing.");

      if (libUtils.common.confirm('Would you like me to upgrade boot2docker for you? (Y/n): ')) {
        libUtils.common.shell('boot2docker', ['stop'], {
          silent: true
        });
        libUtils.common.shell('brew', ['update']);
        libUtils.common.shell('brew', [
          'upgrade',
          'boot2docker'
        ]);
      }
      else {
        throw new Error('Run `brew upgrade boot2docker` to upgrade boot2docker before continuing.');
      }
    }
  }

  // Re-init boot2docker image, even if there is an instance of it.
  libUtils.logger.info('Downloading and setting up boot2docker image...');
  libUtils.common.shell('boot2docker', ['poweroff'], {
    silent: true
  });
  libUtils.common.shell('boot2docker', ['delete'], {
    silent: true
  });
  libUtils.common.shell('boot2docker', ['download']);

  libUtils.logger.info('Powering up boot2docker...');
  libUtils.common.shell('boot2docker', ['init']);
  libUtils.common.shell('boot2docker', ['up']);

  // Prevent multiple initialisation.
  globalConfig.setInit();
};
