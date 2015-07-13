/**
 * @file
 * Environment initialisation library.
 */
'use strict';

var
  libUtils;

libUtils = require('../utils');

exports.init = function (force) {
  // Make sure we don't run this twice.
  if (libUtils.common.checkInit() && !force) {
    throw new Error("Init has already been run. Use '--force' to force a reinit.");
  }


  libUtils.common.setInit();
};
