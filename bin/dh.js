#!/usr/bin/env node
'use strict';

var
  shell,
  yargs,
  libUtils,
  argv,
  cmd;

shell = require('shelljs');
yargs = require('yargs');
libUtils = require('../lib/utils');

argv = yargs.usage('dh <command>')
  .command('init', 'Install boot2docker.', function (yargs) {
    libUtils.runSubscript('dh-init', yargs);
  })
  .command('soe', 'Controls the SOE', function (yargs) {
    libUtils.runSubscript('dh-soe', yargs);
  })
  .command('proxy', 'Commands for the auto-discover proxy container', function (yargs) {
    libUtils.runSubscript('dh-proxy', yargs);
  })
  .command('exec', 'Run a command in a container', function (yargs) {

  })
  .demand(1, 'please provide a valid command')
  .help('h')
  .alias('h', 'help')
  .argv;
