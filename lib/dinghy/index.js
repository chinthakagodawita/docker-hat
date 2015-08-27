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

exports.init = function () {
  var
    out;

  if (shell.which('dinghy') === null) {
    libUtils.logger.info("You don't appear to have dinghy, installing now.");
    libUtils.common.shell('brew', [
      'tap',
      'chinthakagodawita/homebrew-dh'
    ]);
    libUtils.common.shell('brew', ['update']);
    libUtils.common.shell('brew', [
      'install',
      'dinghy'
    ]);
  }

  // Remove any existing dinghy setup.
  libUtils.common.shell('dinghy', [
    'destroy',
    '--force'
  ]);

  // Create dinghy docker machine.
  out = libUtils.common.shell('dinghy', [
    'create',
    '--provider',
    'virtualbox'
  ]);

  if (out.code !== 0) {
    return false;
  }

  // Start dinghy (which installs any requirements).
  return this.start();
}

exports.start = function () {
  var
    out;

  out = libUtils.common.shell('dinghy', ['up']);

  if (out.code !== 0) {
    return false;
  }

  return true;
};

exports.stop = function () {
  libUtils.common.shell('dinghy', ['halt']);
};

exports.isRunning = function () {
  var
    status,
    runCount;

  status = libUtils.common.shell('dinghy', ['status'], {
    silent: true
  });

  runCount = status.output.match(/:\srunning/g);

  // There should be 4 services running: VM, NFS, FSEV & DNS.
  if (runCount !== null && runCount.length >= 4) {
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

exports.getNameserver = function () {
  var
    ip;

  if (!this.isRunning()) {
    throw new Error('Docker host not running.');
  }

  ip = libUtils.common.shell('dinghy', ['nameserver'] , {
    silent: true
  });

  if (ip.code !== 0) {
    throw new Error("Could not determine dinghy DNS nameserver IP.")
  }

  return ip.output.trim();
}
