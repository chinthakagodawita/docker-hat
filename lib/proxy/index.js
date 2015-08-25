/**
 * @file
 * Proxy helpers library.
 */
'use strict';

var
  dockerLib;

dockerLib = require('../docker');

exports.CONTAINER_NAME = 'dh_http_proxy';

// Ports exposed by proxy.
exports.PORTS = ['80', '443', '9000'];

exports.ensureProxy = function () {
  if (!dockerLib.exec.exists(this.CONTAINER_NAME)) {
    this.start();
  }
};

exports.start = function () {
  var
    portDef;

  // Check if container is already running.
  if (dockerLib.exec.exists(this.CONTAINER_NAME)) {
    console.error('The proxy is already running. Try "stop" or "restart" instead.');
    process.exit(1);
  }

  // Get correct structure for ports definition.
  portDef = [];
  this.PORTS.forEach(function (port) {
    portDef.push([port, port]);
  });

  // Start up proxy container using codekitchen's version of the HTTP proxy,
  // this has a large request body that prevents problems. We don't use dinghy's
  // HTTP proxy option directly as it doesn't expose all our ports.
  dockerLib.exec.start({
    name: this.CONTAINER_NAME,
    image: 'codekitchen/dinghy-http-proxy',
    ports: portDef,
    vols: [['/var/run/docker.sock', '/tmp/docker.sock']]
  });
};

exports.stop = function () {
  dockerLib.exec.stop(this.CONTAINER_NAME);
};

exports.restart = function () {
  // Kill if running.
  if (dockerLib.exec.exists(this.CONTAINER_NAME)) {
    dockerLib.exec.stop(this.CONTAINER_NAME);
  }

  // Pass-through to start.
  this.start();
};
