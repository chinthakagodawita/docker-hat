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
          msg,
          out,
          timestamp;

        out = '';
        timestamp = '[' + options.timestamp() + '] ';
        msg = options.level.toUpperCase() + ': ';

        if (undefined !== options.message) {
          msg += options.message;
        }

        if (options.meta && Object.keys(options.meta).length) {
          msg += '\n\t'+ JSON.stringify(options.meta);
        }

        // Only add timestamp if this is a debug-level log entry.
        if (options.level == 'debug') {
          out += timestamp;
        }
        out += wconfig.colorize(options.level, msg);

        return out;
      },
      colorize: true
    })
  ],
  colors: logLevels.colors
});

module.exports = logger;
