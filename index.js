'use strict';

module.exports = {
  name: require('./package').name,

  shouldIncludeChildAddon(addon) {
    return addon.name.indexOf('dummy') !== 0;
  },

  createDocsGenerator(inputTree, { destDir }) {
    let { project } = this;
    let Generator = require('./lib/docs-generator');
    let options = this.app.options['ember-cli-addon-docs-typedoc'] || {};

    return new Generator(inputTree, {
      project,
      destDir,
      packages: options.packages || [this.project.name()],
    });
  },
};
