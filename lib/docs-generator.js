'use strict';

const fs = require('fs-extra');
const path = require('path');
const Plugin = require('broccoli-plugin');
const { fork } = require('child_process');
const { connect } = require('stagehand/lib/adapters/child-process');

module.exports = class DocsGenerator extends Plugin {
  constructor(inputTree, options) {
    super([inputTree]);

    this.destDir = options.destDir;
    this.workerPromise = this.startWorker(options);
  }

  async startWorker(options) {
    let worker = await connect(fork(`${__dirname}/typedoc-worker.js`));

    await worker.start({
      projectName: options.project.name(),
      projectRoot: options.project.root,
    });

    return worker;
  }

  async build() {
    let outFile = `${this.outputPath}/${this.destDir}/index.json`;
    let worker = await this.workerPromise;

    fs.ensureDirSync(path.dirname(outFile));

    await worker.emit(outFile);
  }
}
