/**
 * @file
 * SOE helpers library.
 */
'use strict';

var
  libUtils,
  libDocker,
  libProxy,
  latestVersion;

libUtils = require('../utils');
libDocker = require('../docker');
libProxy = require('../proxy');
latestVersion = 'php5.5';

exports.start = function (opts) {
  if (!opts.name) {
    throw new Error('Container name is required.');
  }

  // Default to latest SOE version if non provided.
  if (!opts.version) {
    opts.version = latestVersion;
  }

  if (!opts.sources) {
    throw new Error('Sources directory is required.');
  }

  // Check if container is already running.
  if (libDocker.exec.exists(opts.name)) {
    libUtils.logger.warn('The container "' + opts.name + '" is already running. Try "stop" or "restart" instead.');
    process.exit(1);
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
  if (!opts.name) {
    throw new Error('Container name is required.');
  }

  // Default to latest SOE version if non provided.
  if (!opts.version) {
    opts.version = latestVersion;
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
