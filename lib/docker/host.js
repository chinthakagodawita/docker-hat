/**
 * @file
 * Docker host helpers library.
 */
'use strict';

var
  libUtils;

libUtils = require('../utils');

exports.isRunning = function () {
  var
    status;

  status = libUtils.common.shell('boot2docker', ['status'], {
    silent: true
  });

  if (status.output === 'running\n') {
    return true;
  }

  return false;
};

exports.start = function () {
  var
    out;

  out = libUtils.common.shell('boot2docker', ['up']);

  if (out.code !== 0) {
    throw new Error('Could not start boot2docker.')
  }
};

exports.stop = function () {
  var
    out;

  out = libUtils.common.shell('boot2docker', ['down']);

  if (out.code !== 0) {
    throw new Error('Could not stop boot2docker.')
  }
};

exports.ensureHost = function () {
  // Start Docker host if it isn't running.
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

  ip = libUtils.common.shell("ifconfig $(VBoxManage showvminfo boot2docker-vm --machinereadable | grep hostonlyadapter | cut -d '\"' -f 2) | grep inet | cut -d ' ' -f 2", [], {
    silent: true
  });

  if (ip.code !== 0) {
    throw new Error("Could not determine current boot2docker host IP.")
  }

  return ip.output.trim();
}
