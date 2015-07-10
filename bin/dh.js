#!/usr/bin/env node
'use strict';

var
  shell,
  yargs,
  argv;

shell = require('shelljs');
yargs = require('yargs');

argv = yargs.usage("$0 command")
  .command("init", "Install boot2docker.", function (yargs) {
    require('./init.js')();
  })
  .command("start", "push changes up to GitHub", function (yargs) {
    require('./start.js')();
  })
  .command("stop", "commit and push changes in one step", function (yargs) {

  })
  .command("restart", "commit and push changes in one step", function (yargs) {

  })
  .command("proxy", "commit and push changes in one step")
  .demand(1, "must provide a valid command")
  .help("h")
  .alias("h", "help")
  .argv

