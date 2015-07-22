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
