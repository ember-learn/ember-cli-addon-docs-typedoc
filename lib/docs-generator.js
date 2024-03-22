'use strict';

const fs = require('fs-extra');
const path = require('path');
const Plugin = require('broccoli-plugin');

module.exports = class DocsGenerator extends Plugin {
  constructor(inputTree, options) {
    super([inputTree]);

    this.destDir = options.destDir;
    this.packageName = options.packages?.[0];
  }

  async build() {
    const { generateTypeDocJSON } = await import('kolay/build');
    // Just keeping these options here so we know what we have.
    // projectRoot: this.options.project.root,
    // packages: this.options.packages,

    let outFile = `${this.outputPath}/${this.destDir}/index.json`;

    fs.ensureDirSync(path.dirname(outFile));

    await generateTypeDocJSON({ packageName: this.packageName });
  }
};
