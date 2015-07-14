/**
 * @file
 * Environment initialisation library.
 */
'use strict';

var
  shell,
  libUtils;

shell = require('shelljs');
libUtils = require('../utils');

exports.init = function (force) {
  // Make sure we don't run this twice.
  if (libUtils.config.checkInit() && !force) {
    throw new Error("Init has already been run. Use '--force' to force a reinit.");
  }

  if (force) {
    libUtils.logger.warn('This will delete any Docker images and containers you may have.');
    // @TODO: Prompt for continue.
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
  libUtils.common.shell('boot2docker', [
    'download',
    '--iso-url="https://api.github.com/repos/chinthakagodawita/boot2docker-custom/releases"'
  ]);
  libUtils.common.shell('boot2docker', ['delete']);
  libUtils.common.shell('boot2docker', ['init']);
  libUtils.common.shell('boot2docker', ['up']);

  // Download profile file so that the docker daemon waits for the local network
  // to come up before starting. This will hopefully be fixed in boot2docker
  // v1.7.1. See https://github.com/boot2docker/boot2docker/issues/824.
  // @TODO: Make this less reliant on bash or atleast explicitly run in bash.
  // libUtils.common.shell('ssh', [
  //   '-i $HOME/.ssh/id_boot2docker',
  //   "-p $(boot2docker config 2>&1 | awk '/SSHPort/ {print $3}')",
  //   'docker@localhost',
  //   '"sudo curl -o /var/lib/boot2docker/profile https://gist.githubusercontent.com/chinthakagodawita/e603c3c0699f5d2fd4cc/raw/3d09c77aae38b4f2809d504784965f5a16f2de4c/profile"'
  // ]);

  // Restart boot2docker image. We do a force-halt just incase there are
  // problems bringing it down.
  // libUtils.logger.info('Restarting boot2docker machine, post-config...');
  // libUtils.common.shell('boot2docker', ['poweroff']);
  // libUtils.common.shell('boot2docker', ['up']);

  // Prevent multiple initialisation.
  libUtils.config.setInit();
};
