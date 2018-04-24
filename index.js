'use strict';

module.exports = {
  name: 'ember-cli-addon-docs-typedoc',

  included() {
    this._super.included.apply(this, arguments);

    if (!this._findTSAddon()) {
      this.ui.writeWarnLine('ember-cli-addon-docs-typedoc requires ember-cli-typescript');
    }
  },

  shouldIncludeChildAddon(addon) {
    return addon.name.indexOf('dummy') !== 0;
  },

  createDocsGenerator(inputTree, options) {
    let Generator = require('./lib/docs-generator');
    let tsAddon = this._findTSAddon();
    if (!tsAddon) return;

    return new Generator(inputTree, {
      compiler: tsAddon.compiler,
      project: this.project,
      destDir: options.destDir
    });
  },

  _findTSAddon() {
    if (!this._tsAddon) {
      this._tsAddon = this.project.addons.find(addon => addon.name === 'ember-cli-typescript');
    }

    return this._tsAddon;
  }
};
