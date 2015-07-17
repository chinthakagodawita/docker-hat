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
    confirm,
    version;

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

  // Check boot2docker version.
  version = libUtils.common.shell('boot2docker', ['version'], {
    silent: true
  });
  version = version.output.match(/^Boot2Docker-cli\sversion:\sv(\d).(\d).(\d)/);
  console.log(version);
  process.exit(1);

  // Install boot2docker.
  if (shell.which('boot2docker') === null) {
    libUtils.logger.info("You don't appear to have boot2docker, installing now.");
    libUtils.common.shell('brew', ['update']);
    libUtils.common.shell('brew', [
      'install',
      'boot2docker'
    ]);
  }

  // Re-init boot2docker image, even if there is an instance of it.
  libUtils.logger.info('Downloading and setting up boot2docker image...');
  libUtils.common.shell('boot2docker', ['poweroff']);
  libUtils.common.shell('boot2docker', ['delete']);
  libUtils.common.shell('boot2docker', ['download']);

  libUtils.logger.info('Powering up boot2docker...');
  libUtils.common.shell('boot2docker', ['init']);
  libUtils.common.shell('boot2docker', ['up']);

  // Prevent multiple initialisation.
  libUtils.config.setInit();
};
