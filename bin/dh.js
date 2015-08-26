#!/usr/bin/env node
'use strict';

var
  shell,
  yargs,
  Config,
  globalConfig,
  libUtils,
  libInit,
  libDocker,

  argv,
  cmd;

shell = require('shelljs');
yargs = require('yargs');

Config = require('../lib/config');
libUtils = require('../lib/utils');
libInit = require('../lib/init');
libDocker = require('../lib/docker');

// Make sure we have everything we need.
libUtils.common.checkRequirements();
globalConfig = new Config(Config.TYPE_GLOBAL);

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
    if (!globalConfig.checkInit(true, 'dh init')) {
      process.exit(1);
    }
    libUtils.common.runSubscript('dh-soe', yargs);
  })
  .command('proxy', 'Commands for the HTTP proxy container.', function (yargs) {
    // Prompt to init if required.
    if (!globalConfig.checkInit(true, 'dh init')) {
      process.exit(1);
    }
    libUtils.common.runSubscript('dh-proxy', yargs);
  })
  .command('exec', 'Run a command in a container.', function (yargs) {
    var
      subArgv,
      cmd;

    // Prompt to init if required.
    if (!globalConfig.checkInit(true, 'dh init')) {
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
  .command('shell', 'Attach to container and open bash shell instance.', function (yargs) {
    var
      subArgv;

    // Prompt to init if required.
    if (!globalConfig.checkInit(true, 'dh init')) {
      process.exit(1);
    }

    subArgv = yargs.reset()
      .usage('dh shell <container name> [options]')
      .option('d', {
        alias: 'debug',
        description: 'Display debug messages.'
      })
      .help('help')
      .argv;

    if (!subArgv._[1]) {
      throw new Error('please provide a container name');
    }

    libDocker.exec.run(subArgv._[1], '/bin/bash', '-it');
  })
  .option('d', {
    alias: 'debug',
    description: 'Display debug messages.'
  })
  .demand(1, '')
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
