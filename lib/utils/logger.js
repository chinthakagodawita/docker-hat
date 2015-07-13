'use strict';

var
  yargs,
  winston,
  wconfig,
  moment,
  logger,
  logLevel,
  logLevels;

yargs = require('yargs');
winston = require('winston');
wconfig = require('winston/lib/winston/config');
moment = require('moment');

logLevel = 'info';
// Show debug if '-d' flag is passed in.
if (yargs.argv.d) {
  logLevel = 'debug';
}

logLevels = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  colors: {
    debug: 'grey',
    info: 'blue',
    warn: 'yellow',
    error: 'red'
  }
};

logger = new (winston.Logger)({
  levels: logLevels.levels,
  transports: [
    new (winston.transports.Console)({
      level: logLevel,
      timestamp: function() {
        return moment().format('HH:mm:ss');
      },
      formatter: function(options) {
        var
          out,
          timestamp;

        timestamp = '[' + options.timestamp() + '] ';
        out = options.level.toUpperCase() + ': ';

        if (undefined !== options.message) {
          out += options.message;
        }

        if (options.meta && Object.keys(options.meta).length) {
          out += '\n\t'+ JSON.stringify(options.meta);
        }

        return timestamp + wconfig.colorize(options.level, out);
      },
      colorize: true
    })
  ],
  colors: logLevels.colors
});

module.exports = logger;
