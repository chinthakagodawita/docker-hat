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
libUtils.checkRequirements();

// Prompt to init if required.
if (!libUtils.checkInit()) {
  console.log("It looks like you haven't run `init` yet.");
  console.log("Please run `dh init` before running any other commands.\n");
}

argv = yargs.usage('dh <command>')
  .command('init', 'Install/configure boot2docker and any other dependencies.', function (yargs) {
    libUtils.runSubscript('dh-init', yargs);
  })
  .command('soe', 'Commands to control SOE containers.', function (yargs) {
    // @TODO: check if init has been run.
    libUtils.runSubscript('dh-soe', yargs);
  })
  .command('proxy', 'Commands for the auto-discover proxy container.', function (yargs) {
    // @TODO: check if init has been run.
    libUtils.runSubscript('dh-proxy', yargs);
  })
  .command('exec', 'Run a command in a container.', function (yargs) {
    // @TODO: check if init has been run.
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
