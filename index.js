'use strict';

module.exports = {
  name: require('./package').name,

  shouldIncludeChildAddon(addon) {
    return addon.name.indexOf('dummy') !== 0;
  },

  createDocsGenerator(inputTree, options) {
    let Generator = require('./lib/docs-generator');

    return new Generator(inputTree, {
      project: this.project,
      destDir: options.destDir
    });
  },
};
