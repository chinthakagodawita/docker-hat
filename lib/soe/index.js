/**
 * @file
 * SOE helpers library.
 */
'use strict';

var
  soeRepo,
  libUtils,
  libDocker,
  libProxy,
  syncRequest,
  latestVersion,
  dockerApiEndpoint;

syncRequest = require('sync-request');

libUtils = require('../utils');
libDocker = require('../docker');
libProxy = require('../proxy');

soeRepo = 'chinthakagodawita/soe';
latestVersion = 'php5.5';

dockerApiEndpoint = 'https://registry.hub.docker.com/v1/repositories/' + soeRepo + '/tags';

exports.start = function (opts) {
  var
    versions;

  if (!opts.name) {
    throw new Error('Container name is required.');
  }

  if (!opts.sources) {
    throw new Error('Sources directory is required.');
  }

  // Check if container is already running.
  if (libDocker.exec.exists(opts.name)) {
    libUtils.logger.warn('The container "' + opts.name + '" is already running. Try "stop" or "restart" instead.');
    process.exit(1);
  }

  // Default to latest SOE version if non provided.
  if (!opts.version) {
    versions = this.getVersions();

    // Default to latest version if we couldn't fetch versions from the Docker
    // registry.
    if (versions === null) {
      opts.version = latestVersion;
    }
    else {
      opts.version = libUtils.common.promptList('Which version of the SOE would you like to run?', versions);
    }
  }

  // Make sure the proxy is running.
  libProxy.ensureProxy();

  // Start up SOE container.
  libDocker.exec.start({
    name: opts.name,
    image: 'chinthakagodawita/soe:' + opts.version,
    vols: [
      [opts.sources, '/var/www']
    ],
    env: [
      ['VIRTUAL_HOST', opts.name],
    ]
  });

  // Update hostname in container's vhost and restart apache.
  libDocker.exec.run(opts.name, 'sh -c "sed -i -r s/---HOSTNAME---/' + opts.name + '/ /etc/apache2/sites-enabled/*default*"');
  libDocker.exec.run(opts.name, 'sh -c "sudo apachectl restart"');
};

exports.stop = function (name) {
  libDocker.exec.stop(name);
};

exports.restart = function (opts) {
  var
    versions;

  if (!opts.name) {
    throw new Error('Container name is required.');
  }

  // Default to latest SOE version if non provided.
  // @TODO: save version in tag and fetch prior to restart.
  if (!opts.version) {
    versions = this.getVersions();

    // Default to latest version if we couldn't fetch versions from the Docker
    // registry.
    if (versions === null) {
      opts.version = latestVersion;
    }
    else {
      opts.version = libUtils.common.promptList('Which version of the SOE would you like to run?', versions);
    }
  }

  if (!opts.sources) {
    throw new Error('Sources directory is required.');
  }

  // Kill if running.
  if (libDocker.exec.exists(opts.name)) {
    libDocker.exec.stop(opts.name);
  }

  // Pass-through to start.
  this.start(opts);
};

exports.getVersions = function () {
  var
    res,
    versions,
    rawVersions;

  versions = null;

  // @TODO: cache results for 1 day unless explicitly told not to.
  res = syncRequest('GET', dockerApiEndpoint, {
    cache: 'file'
  });

  // Catch errors.
  if (res.statusCode != 200) {
    libUtils.logger.error('Could not retrieve SOE versions from Docker registry.');
    return versions;
  }

  rawVersions = JSON.parse(res.getBody().toString());

  versions = [];
  rawVersions.forEach(function (version) {
    versions.push(version.name);
  });

  return versions;
};
