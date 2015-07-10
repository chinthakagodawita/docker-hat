'use strict';

var
  shell;

shell = require('shelljs');

exports.checkRequirements = function () {
  var
    required,
    requirement;

  required = {
    'brew': "Homebrew doesn't appear to be installed. Please see @link for installation instructions.",
    'boot2docker': "Boot2Docker is not installed, please run `dh init` to install.",
    'boot2docker2': "Boot2Docker is not installed, please run `dh init` to install."
  };

  // Make sure we have each requirement.
  for (requirement in required) {
    if (shell.which(requirement) === null) {
      throw new Error(required[requirement]);
    }
  }
};
