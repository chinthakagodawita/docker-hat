#!/usr/bin/env node
'use strict';

var
  shell,
  yargs,
  libExec,
  argv,
  cmd;

shell = require('shelljs');
yargs = require('yargs');
libExec = require('../lib/docker/execution');

argv = yargs.usage('dh soe <command>')
  .command('start', 'Start a SOE container', function (yargs) {
    var
      subArgv,
      sources;

    subArgv = yargs.usage('dh soe start <container name> [options]')
    .option('s', {
      alias: 'sources',
      description: 'Directory to use for sources, defaults to the current directory'
    })
    .help('help')
    .argv;

    if (!subArgv._[1]) {
      throw new Error('please provide a container name');
    }

    if (!subArgv.s) {
      sources = '.';
    }

    libExec.startContainer({
      name: subArgv._[1],
      vols: []
    });
  })
  .command('stop', 'commit and push changes in one step', function (yargs) {

  })
  .command('restart', 'commit and push changes in one step', function (yargs) {

  })
  .demand(1, 'please provide a valid command')
  .example('dh soe start mysite.dev', 'Start a container with the hostname "mysite.dev" using sources from the current directory.')
  .example('dh soe stop mysite.dev', 'Stops the "mysite.dev" container if it exists.')
  .example('dh soe restart mysite.dev', 'Stops the "mysite.dev" container if it exists and starts it back up using sources from the current directory.')
  .check(function (argv, opts) {
    if (!argv._[0].match(/start|stop|restart/)) {
      throw new Error('please provide a valid command');
    }
  })
  .help('h')
  .alias('h', 'help')
  .argv;
