/**
 * @file
 * SOE helpers library.
 */
'use strict';

var
  dockerLib,
  proxyLib,
  latestVersion;

dockerLib = require('../docker');
proxyLib = require('../proxy');
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
  if (dockerLib.exec.exists(opts.name)) {
    console.error('The container "' + opts.name + '" is already running. Try "stop" or "restart" instead.');
    process.exit(1);
  }

  // Make sure the proxy is running.
  proxyLib.ensureProxy();

  // Start up SOE container.
  dockerLib.exec.start({
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
  dockerLib.exec.run(opts.name, 'sh -c "sed -i -r s/---HOSTNAME---/' + opts.name + '/ /etc/apache2/sites-enabled/*default*"');
  dockerLib.exec.run(opts.name, 'sh -c "sudo apachectl restart"');
};

exports.stop = function (name) {
  dockerLib.exec.stop(name);
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
  if (dockerLib.exec.exists(opts.name)) {
    dockerLib.exec.stop(opts.name);
  }

  // Pass-through to start.
  this.start(opts);
};
