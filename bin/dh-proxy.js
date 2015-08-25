#!/usr/bin/env node
'use strict';

var
  yargs,
  libProxy,
  argv,
  cmd;

yargs = require('yargs');
libProxy = require('../lib/proxy');

argv = yargs.usage('dh proxy <command>')
  .command('start', 'Start the HTTP proxy container', function (yargs) {
    libProxy.start();
  })
  .command('stop', 'Stop the HTTP proxy container', function (yargs) {
    libProxy.stop();
  })
  .command('restart', 'Restart the HTTP proxy container', function (yargs) {
    libProxy.restart();
  })
  .option('d', {
    alias: 'debug',
    description: 'Display debug messages.'
  })
  .demand(1, '')
  .check(function (argv, opts) {
    if (!argv._[0].match(/start|stop|restart/)) {
      throw new Error('please provide a valid command');
    }
  })
  .help('h')
  .alias('h', 'help')
  .argv;
