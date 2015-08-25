/**
 * @file
 * Docker execution helpers library.
 */
'use strict';

var
  spawnSync,
  libUtils,
  libDinghy;

spawnSync = require('child_process').spawnSync;

libUtils = require('../utils');
libDinghy = require('../dinghy');

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
    hosts,
    dockerArgs,
    tupleToArgs;

  vols = '';
  env = '';
  hosts = '';

  // Make sure we've got a Docker host.
  libDinghy.ensureRunning();

  // Converts a list of tuple arguments into a string.
  tupleToArgs = function (tupleList, argFlag, separator) {
    var out = '';

    tupleList.forEach(function (tuple) {
      out += ' ' + argFlag + tuple.join(separator);
    });

    return out;
  };

  if (!opts.name) {
    throw new Error('Container name is required.');
  }

  if (!opts.image) {
    throw new Error('Container image is required.');
  }

  // Pull image to make sure we've got the latest version.
  this.pull(opts.image);

  if (opts.vols) {
    vols = tupleToArgs(opts.vols, '-v ', ':');
  }

  if (opts.env) {
    env = tupleToArgs(opts.env, '-e ', '=');
  }

  if (opts.ports) {
    ports = tupleToArgs(opts.ports, '-p ', ':');
  }

  if (opts.hosts) {
    hosts = tupleToArgs(opts.hosts, '--add-host=', ':')
  }

  dockerArgs = [
    'run',
    '-d',
    '--name=' + opts.name,
    env,
    vols,
    ports,
    hosts,
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
    libUtils.common.shell('docker', ['rm', '-f', name], {
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

  out = libUtils.common.shell('docker', ['inspect', name], {
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
    name
  ];

  if (typeof cmd !== 'string') {
    // If we have arguments for the command, send them in as arguments to
    // spawnSync().
    args = args.concat(cmd);
  }
  else {
    args.push(cmd);
  }

  libUtils.logger.debug('Executing: docker ' + args.join(' '));
  ret = spawnSync('docker', args, {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  // Success.
  if (ret.status === 0) {
    return true;
  }

  libUtils.logger.error("Could not run command '" + cmd + "' in container '" + name + "'.");
  return false;
};

exports.pull = function (image) {
  libUtils.common.shell('docker', ['pull', image], {
    silent: true
  });
}
