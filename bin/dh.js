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

// Make sure we have everything we need.
libUtils.common.checkRequirements();

argv = yargs.usage('dh <command>')
  .command('init', 'Install/configure boot2docker and any other dependencies.', function (yargs) {
    libUtils.common.runSubscript('dh-init', yargs);
  })
  .command('soe', 'Commands to control SOE containers.', function (yargs) {
    // Prompt to init if required.
    if (!libUtils.common.checkInit(true)) {
      // process.exit(1);
    }
    libUtils.common.runSubscript('dh-soe', yargs);
  })
  .command('proxy', 'Commands for the auto-discover proxy container.', function (yargs) {
    // Prompt to init if required.
    if (!libUtils.common.checkInit(true)) {
      process.exit(1);
    }
    libUtils.common.runSubscript('dh-proxy', yargs);
  })
  .command('exec', 'Run a command in a container.', function (yargs) {
    // Prompt to init if required.
    if (!libUtils.common.checkInit(true)) {
      process.exit(1);
    }
  })
  .option('d', {
    alias: 'debug',
    description: 'Display debug messages.'
  })
  .demand(1, 'please provide a valid command')
  .check(function (argv, opts) {
    if (!argv._[0].match(/init|soe|proxy|exec/)) {
      throw new Error('please provide a valid command');
    }
  })
  .help('h')
  .alias('h', 'help')
  .argv;
