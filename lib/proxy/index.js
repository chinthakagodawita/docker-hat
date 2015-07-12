/**
 * @file
 * Proxy helpers library.
 */
'use strict';

var
  dockerLib,
  proxyPorts,
  proxyContainerName;

dockerLib = require('../docker');
proxyContainerName = 'dh_autohost_proxy';
proxyPorts = ['80', '443', '9000'];

exports.ensureProxy = function () {
  if (!dockerLib.exec.exists(proxyContainerName)) {
    this.start();
  }
};

exports.start = function () {
  var
    portDef;

  // Check if container is already running.
  if (dockerLib.exec.exists(proxyContainerName)) {
    console.error('The proxy is already running. Try "stop" or "restart" instead.');
    process.exit(1);
  }

  // Get correct structure for ports definition.
  portDef = [];
  proxyPorts.forEach(function (port) {
    portDef.push([port, port]);
  });

  // Start up proxy container.
  dockerLib.exec.start({
    name: proxyContainerName,
    image: 'jwilder/nginx-proxy',
    ports: portDef,
    vols: [['/var/run/docker.sock', '/tmp/docker.sock:ro']]
  });
};

exports.stop = function () {
  dockerLib.exec.stop(proxyContainerName);
};

exports.restart = function () {
  // Kill if running.
  if (dockerLib.exec.exists(proxyContainerName)) {
    dockerLib.exec.stop(proxyContainerName);
  }

  // Pass-through to start.
  this.start();
};
