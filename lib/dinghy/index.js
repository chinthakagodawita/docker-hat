/**
 * @file
 * Dinghy helpers library.
 */
'use strict';

var
  shell,
  libUtils;

shell = require('shelljs');

libUtils = require('../utils');

exports.DINGHY_URL = 'https://github.com/codekitchen/dinghy/raw/latest/dinghy.rb';

exports.init = function () {
  if (shell.which('dinghy') === null) {
    libUtils.logger.info("You don't appear to have dinghy, installing now.");
    libUtils.common.shell('brew', [
      'install',
      this.DINGHY_URL
    ]);
  }

  // Remove any existing dinghy setup.
  libUtils.common.shell('dinghy', [
    'destroy',
    '--force'
  ]);

  // Start dinghy (which installs any requirements).
  this.start();
}

exports.start = function () {
  libUtils.common.shell('dinghy', ['up']);
};

exports.stop = function () {
  libUtils.common.shell('dinghy', ['stop']);
};

exports.isRunning = function () {
  var
    status;

  status = libUtils.common.shell('dinghy', ['status'], {
    silent: true
  });

  // There should be 4 services running: VM, NFS, FSEV & DNS.
  if (status.output.match(/:\srunning/g).length == 4) {
    return true;
  }

  return false;
};

exports.ensureRunning = function () {
  // Start dinghy host if it isn't running.
  if (!this.isRunning()) {
    libUtils.logger.info('Docker host not running, attempting to start now...');
    this.start();
  }
};

exports.getIp = function () {
  var
    ip;

  if (!this.isRunning()) {
    throw new Error('Docker host not running.');
  }

  ip = libUtils.common.shell('dinghy ssh \'netstat -rn | grep "^0.0.0.0 " | cut -d " " -f10\'', [] , {
    silent: true
  });

  if (ip.code !== 0) {
    throw new Error("Could not determine current Docker host IP.")
  }

  return ip.output.trim();
}
