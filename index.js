/* jshint node: true */
'use strict';

var path = require('path');
var checker = require('ember-cli-version-checker');
var emblemTemplateCompiler = require('./emblem-template-compiler');

module.exports = {
  name: 'ember-cli-emblem-hbs-printer',

  init: function() {
    checker.assertAbove(this, '0.1.2');
  },

  shouldSetupRegistryInIncluded: function() {
    return !checker.isAbove(this, '0.2.0');
  },

  setupPreprocessorRegistry: function(type, registry) {
    // Ensure that broccoli-emblem-compiler is not processing embl or emblem files.
    registry.remove('template', 'broccoli-emblem-compiler');

    var plugin = {
      name: 'ember-cli-emblem-hbs-printer',
      ext: 'test',
      toTree: function(tree) {
        return emblemTemplateCompiler(tree);
      }
    };

    registry.add('template', plugin);
  },

  included: function (app) {
    this._super.included.apply(this, arguments);

    if (this.shouldSetupRegistryInIncluded()) {
      this.setupPreprocessorRegistry('parent', app.registry);
    }
  }
};
