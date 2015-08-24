/**
 * @file
 * Docker host helpers library.
 */
'use strict';

var
  fs,
  path,
  shelljs,
  libUtils;

fs = require('fs');
path = require('path');
shelljs = require('shelljs');

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

exports.init = function () {
  // Do NFS setup before attempting boot2docker.
  this.setupNfs();

  // Re-init boot2docker image, even if there is an instance of it.
  libUtils.logger.info('Downloading and setting up boot2docker image...');
  libUtils.common.shell('boot2docker', ['poweroff'], {
    silent: true
  });
  libUtils.common.shell('boot2docker', ['delete'], {
    silent: true
  });
  libUtils.common.shell('boot2docker', ['download']);
  libUtils.common.shell('boot2docker', ['init']);
};

exports.setupNfs = function () {
  var
    exportsTpl,
    exportsFile,
    exportsContents,
    currentUser;

  // Setup NFS on Mac.
  libUtils.logger.info('Setting up local NFS server, you may be prompted for your password.');

  currentUser = libUtils.common.shell('whoami', [], {
    silent: true
  });

  if (currentUser.code !== 0) {
    libUtils.logger.error('Could not determine current user via `whoami`.');
    process.exit(1);
  }

  currentUser = currentUser.output.trim();

  exportsTpl = "# Docker NFS\n";
  exportsTpl += '"/Users/' + currentUser + '" -alldirs -mapall=' + currentUser + ' -network 192.168.59.0 -mask 255.255.255.0';

  exportsFile = path.resolve('/etc/exports');
  try {
    exportsContents = fs.readFileSync(exportsFile, {
      encoding: 'utf8'
    });

    // Check if the exports file already has an entry, short-circuit if so.
    if (exportsContents.indexOf(exportsTpl) > -1) {
      return true;
    }
  }
  catch (e) {
    libUtils.logger.debug('Could not find /etc/exports file, creating.');
    // Ignore error, we'll create the file.
    libUtils.common.shell('sudo', ['touch', exportsFile]);
  }

  // exportsContents += "\n" + exportsTpl;

  // Write file via shell since we need root access (pipe through sudo).
  // fs.appendFileSync(exportsFile, exportsTpl);
  console.log(shelljs.tempdir());
  // shelljs.echo(exportsTpl);
  process.exit(1);
  // exportsFile.toEnd(exportsFile)
  // libUtils.common.shell("sudo echo '" + exportsTpl + "' >> " + exportsFile);

  // Restart NFSD.
  libUtils.logger.info('NFS setup complete, restarting NFS server...');
  libUtils.common.shell('sudo', [
    'nfsd',
    'checkexports'
  ]);
  libUtils.common.shell('sudo', [
    'nfsd',
    'restart'
  ]);

  process.exit(1);
};

exports.start = function () {
  var
    out;

  out = libUtils.common.shell('boot2docker', [
    'up',
    '--vbox-share=disable'
  ]);

  if (out.code !== 0) {
    throw new Error('Could not start Docker host.')
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
    throw new Error("Could not determine current Docker host IP.")
  }

  return ip.output.trim();
}
