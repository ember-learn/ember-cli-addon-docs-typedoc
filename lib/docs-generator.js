'use strict';

const fs = require('fs-extra');
const path = require('path');
const Plugin = require('broccoli-plugin');
const { Application } = require('typedoc');
const { Context, Converter } = require('typedoc/dist/lib/converter');

// Note to self: document (and maybe find a way to programmatically warn?)
// that nothing will work if Typedoc's version of TS doesn't match the project one

module.exports = class DocsGenerator extends Plugin {
  constructor(inputTree, options) {
    super([inputTree]);

    this.project = options.project;
    this.compiler = options.compiler;
    this.destDir = options.destDir;
    this.app = new Application();
  }

  build() {
    let { converter, serializer } = this.app;
    let program = this.compiler.getProgram().getProgram();
    let includeFiles = program.getSourceFiles()
      .map(source => source.fileName)
      .filter(file => file.indexOf(this.project.root) === 0 && file.indexOf('node_modules') === -1);

    let context = new Context(converter, includeFiles, program.getTypeChecker(), program);
    let outFile = `${this.outputPath}/${this.destDir}/index.json`;

    converter.trigger(Converter.EVENT_BEGIN, context);
    converter.compile(context);
    converter.resolve(context);
    converter.trigger(Converter.EVENT_END, context);

    fs.ensureDirSync(path.dirname(outFile));
    fs.writeJSONSync(outFile, { data: [] }, { spaces: 2 });

    // Just log to stdout for debugging for now
    this.project.ui.writeLine('TypeDoc Output (this needs to be converted to AddonDocs format):');
    this.project.ui.writeLine(JSON.stringify(serializer.projectToObject(context.project), null, 2));
  }
}
