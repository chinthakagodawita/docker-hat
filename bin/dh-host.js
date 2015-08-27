#!/usr/bin/env node
'use strict';

var
  yargs,
  libDinghy,
  argv,
  cmd;

yargs = require('yargs');

libDinghy = require('../lib/dinghy');

argv = yargs.usage('dh soe <command>')
  .command('start', 'Start the Docker host', function (yargs) {
    libDinghy.start();
  })
  .command('stop', 'Stop the host', function (yargs) {
    libDinghy.stop();
  })
  .command('restart', 'Restart the host', function (yargs) {
    libDinghy.restart();
  })
  .command('status', 'Show host status', function (yargs) {
    libDinghy.status();
  })
  .option('d', {
    alias: 'debug',
    description: 'Display debug messages.'
  })
  .demand(1, '')
  .check(function (argv, opts) {
    if (!argv._[0].match(/start|stop|restart|status/)) {
      throw new Error('please provide a valid command');
    }
  })
  .help('h')
  .alias('h', 'help')
  .argv;
