/**
 * @file
 * Environment initialisation library.
 */
'use strict';

var
  shell,
  readline,
  libUtils;

shell = require('shelljs');
readline = require('readline-sync');
libUtils = require('../utils');

exports.init = function (force) {
  var
    confirm;

  confirm = null;

  // Make sure we don't run this twice.
  if (libUtils.config.checkInit() && !force) {
    throw new Error("Init has already been run. Use '--force' to force a reinit.");
  }

  if (force) {
    libUtils.logger.warn('This will delete any Docker images and containers you may have.');

    // Prompt while we get valid output.
    while (confirm !== false && confirm !== true) {
      confirm = readline.question('Continue? (Y/n): ', {
        trueValue: 'y',
        falseValue: 'n'
      });
    }

    if (!confirm) {
      throw new Error('Cancelled by user');
    }
  }

  // Install boot2docker.
  if (shell.which('boot2docker') === null) {
    libUtils.logger.info("You don't appear to have boot2docker, installing now.");
    libUtils.common.shell('brew', [
      'update'
    ]);
    libUtils.common.shell('brew', [
      'install',
      'boot2docker'
    ]);
  }

  // Re-init boot2docker image, even if there is an instance of it.
  libUtils.logger.info('Downloading and setting up boot2docker image...');
  libUtils.common.shell('boot2docker', ['poweroff']);
  libUtils.common.shell('boot2docker', ['delete']);

  // Use custom boot2docker build. This has a change so that the docker daemon
  // waits for the local network to come up before starting. This will hopefully
  // be fixed in boot2docker v1.7.1.
  // See https://github.com/boot2docker/boot2docker/issues/824.
  libUtils.common.shell('boot2docker', [
    'download',
    '--iso-url="https://api.github.com/repos/chinthakagodawita/boot2docker-custom/releases"'
  ]);

  libUtils.common.shell('boot2docker', ['init']);
  libUtils.common.shell('boot2docker', ['up']);

  // Prevent multiple initialisation.
  libUtils.config.setInit();
};
