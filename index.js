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

    registry.add('template', {
      name: 'ember-cli-emblem-hbs-printer',
      ext: ['embl', 'emblem'],
      toTree: function(tree) {
        return emblemTemplateCompiler(tree);
      }
    });
  },

  /**
    Organizes the app or addon registry plugin array so that the
    `ember-cli-emblem-hbs-printer` is always ran before a Handlebars processor.
    @method
    @private
    @param {Object} registry A registry model for the app or addon.
  */
  organizePreprocessorRegistry: function(registry) {
    var embAt = registeredIndexOf(registry, 'ember-cli-emblem-hbs-printer');
    var hbsAt = Math.max(
      registeredIndexOf(registry, 'ember-cli-htmlbars'),
      registeredIndexOf(registry, 'broccoli-ember-hbs-template-compiler')
    );

    if (hbsAt >= 0 && embAt >= 0 && embAt > hbsAt) {
      var temp = registry.registry.template[hbsAt];

      registry.registry.template[hbsAt] = registry.registry.template[embAt];
      registry.registry.template[embAt] = temp;
    }
  },

  included: function (app) {
    this._super.included.apply(this, arguments);

    if (this.shouldSetupRegistryInIncluded()) {
      this.setupPreprocessorRegistry('parent', app.registry);
    }

    // Ensure that this preprocessor runs before any hbs preprocessor.
    this.organizePreprocessorRegistry(app.registry);
  }
};

function registeredIndexOf(registry, name) {
  var registered = registry.registeredForType('template');

  for (var i = 0, l = registered.length; i < l; i++) {
    if (registered[i].name === name) {
      return i;
    }
  }

  return -1;
}
