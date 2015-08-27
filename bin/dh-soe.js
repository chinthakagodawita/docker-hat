#!/usr/bin/env node
'use strict';

var
  shell,
  yargs,
  libSoe,
  libUtils,
  libDocker,
  argv,
  cmd;

shell = require('shelljs');
yargs = require('yargs');
libSoe = require('../lib/soe').exec;
libUtils = require('../lib/utils');
libDocker = require('../lib/docker');

argv = yargs.usage('dh soe <command>')
  .command('start', 'Start a SOE container', function (yargs) {
    libSoe.start(libUtils.common.getYargsContainerInfo(yargs, 'start'));
  })
  .command('stop', 'Stop a SOE container', function (yargs) {
    var
      name,
      subArgv,
      sources;

    subArgv = yargs.usage('dh soe stop <container name>')
    .option('d', {
      alias: 'debug',
      description: 'Display debug messages.'
    })
    .help('help')
    .argv;

    if (!subArgv._[1]) {
      name = null;
    }
    else {
      name = subArgv._[1];
    }

    libSoe.stop(name);
  })
  .command('restart', 'Restart a SOE container', function (yargs) {
    libSoe.restart(libUtils.common.getYargsContainerInfo(yargs, 'restart'));
  })
  .command('drush', 'Run Drush inside a SOE container', function (yargs) {
    var
      subArgv;

    subArgv = yargs.reset()
    .usage('dh soe drush <container name> [<commands>] [options]')
    .option('d', {
      alias: 'debug',
      description: 'Display debug messages.'
    })
    .help('help')
    .argv;

    libSoe.runDrush(subArgv._.slice(1));
  })
  .option('d', {
    alias: 'debug',
    description: 'Display debug messages.'
  })
  .demand(1, '')
  .example('dh soe start mysite', 'Start a container with the hostname "mysite.docker" using sources from the current directory.')
  .example('dh soe stop mysite', 'Stops the "mysite.docker" container if it exists.')
  .example('dh soe restart mysite', 'Stops the "mysite.docker" container if it exists and starts it back up.')
  .example('dh soe drush mysite cc all', 'Clears the Drupal cache in the "mysite.docker" container via Drush.')
  .check(function (argv, opts) {
    if (!argv._[0].match(/start|drush|stop|restart/)) {
      throw new Error('please provide a valid command');
    }
  })
  .help('h')
  .alias('h', 'help')
  .argv;
