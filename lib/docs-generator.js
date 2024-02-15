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
    let child = fork(`${__dirname}/typedoc-worker.js`);
    let worker = await connect(child);

    process.on('exit', () => child.kill());

    await worker.start({
      projectRoot: options.project.root,
      packages: options.packages,
    });

    return worker;
  }

  async build() {
    let outFile = `${this.outputPath}/${this.destDir}/index.json`;
    let worker = await this.workerPromise;

    fs.ensureDirSync(path.dirname(outFile));

    await worker.emit(outFile);
  }
};
