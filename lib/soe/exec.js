/**
 * @file
 * SOE execution helpers library.
 */
'use strict';

var
  path,
  soeRepo,
  Config,
  libUtils,
  libDocker,
  libDinghy,
  syncRequest,
  latestVersion,
  dockerApiEndpoint;

path = require('path');
syncRequest = require('sync-request');

Config = require('../config');
libUtils = require('../utils');
libDocker = require('../docker');
libDinghy = require('../dinghy');

soeRepo = 'chinthakagodawita/soe';
latestVersion = 'php5.5';

dockerApiEndpoint = 'https://registry.hub.docker.com/v1/repositories/' + soeRepo + '/tags';

exports.start = function (opts) {
  var
    versions,
    localConfig,
    phpOverrides;

  if (!opts.sources) {
    throw new Error('Sources directory is required.');
  }

  // Check for initialisation.
  // localConfig = new Config(Config.TYPE_LOCAL, opts.sources);
  // if (!localConfig.checkInit(true, 'dh soe init')) {
  //   phpOverrides = localConfig.getConfig(Config.FILE_PHP);
  //   console.log(phpOverrides);
  //   if (!libUtils.common.isEmptyObject(phpOverrides)) {
  //     for (var phpOverrideKey in phpOverrides) {
  //       console.log(phpOverrideKey);
  //       console.log(phpOverrides[phpOverrideKey]);
  //     }
  //   }
  //   // process.exit(1);
  // }

  if (!opts.name) {
    throw new Error('Container name is required.');
  }

  // Make sure we've got a Docker host.
  libDinghy.ensureRunning();

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

  // Start up SOE container.
  libDocker.exec.start({
    name: opts.name,
    image: 'chinthakagodawita/soe:' + opts.version,
    vols: [
      [opts.sources, '/var/www']
    ],
    env: [
      ['VIRTUAL_HOST', opts.name],
    ],
    hosts: [
      ['hostbox', libDinghy.getIp()]
    ]
  });

  // Update hostname in container's vhost.
  libDocker.exec.run(opts.name, 'sh -c "sed -i -r s/---HOSTNAME---/' + opts.name + '/ /etc/apache2/sites-enabled/*default*"');

  // Set PHP overrides if we have any.
  // if (!libUtils.common.isEmptyObject(phpOverrides)) {
  //   // Create local overrides INI file.
  //   libDocker.exec.run(opts.name, 'touch /etc/php5/conf.d/php.ini');

  //   for (var phpOverrideKey in phpOverrides) {
  //     console.log(phpOverrideKey);
  //     console.log(phpOverrides[phpOverrideKey]);
  //   }
  // }

  // Restart all services
  libDocker.exec.run(opts.name, 'sh -c "supervisorctl restart all"');
};

exports.stop = function (name) {
  libDocker.exec.stop(name);
};

exports.restart = function (opts) {
  var
    inspect,
    version;

  if (!opts.name) {
    throw new Error('Container name is required.');
  }

  if (!opts.sources) {
    throw new Error('Sources directory is required.');
  }

  if (libDocker.exec.exists(opts.name)) {
    // Extract version from container.
    if (!opts.version) {
      inspect = libUtils.common.shell('docker', 'inspect ' + opts.name, {
        silent: true
      });
      if (inspect.code === 0) {
        version = JSON.parse(inspect.output)[0].Config.Image;
        version = version.split(':');
        opts.version = version[1];
      }
    }

    // Kill if running.
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
