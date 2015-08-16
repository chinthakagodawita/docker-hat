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
libSoe = require('../lib/soe');
libUtils = require('../lib/utils');
libDocker = require('../lib/docker');

argv = yargs.usage('dh soe <command>')
  .command('start', 'Start a SOE container', function (yargs) {
    libSoe.start(libUtils.common.getYargsContainerInfo(yargs, 'start'));
  })
  .command('stop', 'Stop a SOE container', function (yargs) {
    var
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
      throw new Error('please provide a container name');
    }

    libSoe.stop(subArgv._[1]);
  })
  .command('restart', 'Restart a SOE container', function (yargs) {
    libSoe.restart(libUtils.common.getYargsContainerInfo(yargs, 'restart'));
  })
  .command('drush', 'Run Drush inside a SOE container', function (yargs) {
    var
      subArgv,
      cmd;

    subArgv = yargs.reset()
    .usage('dh soe drush <container name> [<commands>] [options]')
    .option('d', {
      alias: 'debug',
      description: 'Display debug messages.'
    })
    .help('help')
    .argv;

    if (!subArgv._[1]) {
      throw new Error('please provide a container name');
    }

    // @todo: move this into a library.
    cmd = [
      'drush',
      '--root=/var/www'
    ];
    if (subArgv._.length > 1) {
      cmd = cmd.concat(subArgv._.slice(2));
    }

    libDocker.exec.run(subArgv._[1], cmd, '-it');
  })
  .option('d', {
    alias: 'debug',
    description: 'Display debug messages.'
  })
  .demand(1, 'please provide a valid command')
  .example('dh soe start mysite.dev', 'Start a container with the hostname "mysite.dev" using sources from the current directory.')
  .example('dh soe stop mysite.dev', 'Stops the "mysite.dev" container if it exists.')
  .example('dh soe restart mysite.dev', 'Stops the "mysite.dev" container if it exists and starts it back up using sources from the current directory.')
  .example('dh soe drush mysite.dev cc all', 'Clears the Drupal cache in the "mysite.dev" container via Drush.')
  .check(function (argv, opts) {
    if (!argv._[0].match(/start|stop|restart/)) {
      throw new Error('please provide a valid command');
    }
  })
  .help('h')
  .alias('h', 'help')
  .argv;
