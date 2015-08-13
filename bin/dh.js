#!/usr/bin/env node
'use strict';

var
  shell,
  yargs,
  libUtils,
  libInit,
  libDocker,
  argv,
  cmd;

shell = require('shelljs');
yargs = require('yargs');
libUtils = require('../lib/utils');
libInit = require('../lib/init');
libDocker = require('../lib/docker');

// Make sure we have everything we need.
libUtils.common.checkRequirements();

argv = yargs.usage('dh <command>')
  .command('init', 'Install/configure boot2docker and any other dependencies.', function (yargs) {
    var
      subArgv,
      force;

    subArgv = yargs.reset()
      .usage('dh init [options]')
      .option('f', {
        alias: 'force',
        description: 'Ignore initialisation status and force reinit.'
      })
      .help('help')
      .argv;

    libInit.init(subArgv.f);
  })
  .command('soe', 'Commands to control SOE containers.', function (yargs) {
    // Prompt to init if required.
    if (!libUtils.config.checkInit(true)) {
      process.exit(1);
    }
    libUtils.common.runSubscript('dh-soe', yargs);
  })
  .command('proxy', 'Commands for the auto-discover proxy container.', function (yargs) {
    // Prompt to init if required.
    if (!libUtils.config.checkInit(true)) {
      process.exit(1);
    }
    libUtils.common.runSubscript('dh-proxy', yargs);
  })
  .command('exec', 'Run a command in a container.', function (yargs) {
    var
      subArgv,
      cmd;

    // Prompt to init if required.
    if (!libUtils.config.checkInit(true)) {
      process.exit(1);
    }

    subArgv = yargs.reset()
      .usage('dh exec <container name> <command> [options]')
      .option('d', {
        alias: 'debug',
        description: 'Display debug messages.'
      })
      .help('help')
      .argv;

    if (!subArgv._[1]) {
      throw new Error('please provide a container name');
    }

    if (!subArgv._[2]) {
      throw new Error('please provide a command to execute');
    }

    // Get entire command set.
    cmd = subArgv._.slice(2);
    libDocker.exec.run(subArgv._[1], cmd, '-it');
  })
  .option('d', {
    alias: 'debug',
    description: 'Display debug messages.'
  })
  .demand(1, 'please provide a valid command')
  .version(function() {
    return require('../package').version;
  })
  .check(function (argv, opts) {
    if (!argv._[0].match(/init|soe|proxy|exec/)) {
      throw new Error('please provide a valid command');
    }
  })
  .help('h')
  .alias('h', 'help')
  .argv;
