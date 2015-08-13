/**
 * @file
 * Docker execution helpers library.
 */
'use strict';

var
  host,
  spawnSync,
  libUtils;

spawnSync = require('child_process').spawnSync;

libUtils = require('../utils');
host = require('./host.js');

/**
 * Starts up a new Docker container.
 *
 * @param {object} opts
 *   Paramaters for the Docker run command, required keys:
 *   @TODO
 */
exports.start = function (opts) {
  var
    out,
    ports,
    vols,
    env,
    dockerArgs,
    tupleToArgs;

  vols = '';
  env = '';

  // Make sure we've got a Docker host.
  host.ensureHost();

  // Converts a list of tuple arguments into a string.
  tupleToArgs = function (tupleList, argName, separator) {
    var out = '';

    tupleList.forEach(function (tuple) {
      out += ' -' + argName + ' ' + tuple.join(separator);
    });

    return out;
  };

  if (!opts.name) {
    throw new Error('Container name is required.');
  }

  if (!opts.image) {
    throw new Error('Container image is required.');
  }

  if (opts.vols) {
    vols = tupleToArgs(opts.vols, 'v', ':');
  }

  if (opts.env) {
    env = tupleToArgs(opts.env, 'e', '=');
  }

  if (opts.ports) {
    ports = tupleToArgs(opts.ports, 'p', ':');
  }

  dockerArgs = [
    'run',
    '-d',
    '--name=' + opts.name,
    env,
    vols,
    ports,
    // '--net=host',
    '-t',
    opts.image
  ];

  libUtils.logger.debug("running: " + 'docker ' + dockerArgs.join(' '));
  out = libUtils.common.shell('docker', dockerArgs);

  if (out.code === 0) {
    libUtils.logger.info("Started up Docker container '" + opts.name + "'.");
  }
  else {
    libUtils.logger.error("Could not start container, error was: " + out.output + ".");
  }
};

/**
 * Stops and removes a running Docker container.
 *
 * @param {string} name
 *   Name of container to stop.
 */
exports.stop = function (name) {
  if (this.exists(name)) {
    libUtils.common.shell('docker', 'rm -f ' + name, {
      silent: true
    });
    libUtils.logger.info("Stopped and removed container '" + name + "'.");
  }
  else {
    libUtils.logger.error("Container '" + name + "' not found, could not stop.");
  }
};

/**
 * Checks to see whether a Docker container is running.
 *
 * @param {string} name
 *   Name of container to check.
 *
 * @return {boolean}
 *   TRUE if container exists, FALSE otherwise.
 */
exports.exists = function (name) {
  var
    out,
    info;

  out = libUtils.common.shell('docker', 'inspect ' + name, {
    silent: true
  });

  if (out.code === 0) {
    info = JSON.parse(out.output);

    if (info.length > 0) {
      return true;
    }
  }

  return false;
};

exports.run = function (name, cmd, opts) {
  var
    ret,
    args;

  // Options to pass to Docker exec, usually either '-d' or '-it'.
  if (typeof opts === 'undefined') {
    opts = '-d';
  }

  args = [
    'exec',
    opts,
    name,
    cmd
  ];

  libUtils.logger.debug('Executing: docker ' + args.join(' '));
  ret = spawnSync('docker', args, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  process.exit(ret.status);

  // Success.
  if (ret.status === 0) {
    return true;
  }

  libUtils.logger.error("Could not run command '" + cmd + "' in container '" + name + "'.");
  return false;
};
