'use strict';

const resolve = require('resolve');
const path = require('path');
const fs = require('fs-extra');
const { launch } = require('stagehand/lib/adapters/child-process');
const { Application } = require('typedoc');
const { Context, Converter } = require('typedoc/dist/lib/converter');
const loadFromReflection = require('./load-from-reflection');
const Serializer = require('./serializer');

class TypedocWorker {
  constructor() {
    this.app = new Application();
    this.compiler = null;
    this.options = null;
  }

  start(options) {
    let ts = require(resolve.sync('typescript', { basedir: path.dirname(require.resolve('typedoc/package.json')) }));
    let configFile = ts.findConfigFile(options.projectRoot, ts.sys.fileExists, 'tsconfig.json');
    let host = ts.createWatchCompilerHost(
      configFile,
      {},
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      () => {},
      () => {}
    );

    this.options = options;
    this.compiler = ts.createWatchProgram(host);
  }

  emit(outFile) {
    let { converter } = this.app;
    let program = this.compiler.getProgram().getProgram();
    let includeFiles = program.getSourceFiles()
      .map(source => path.resolve(source.fileName))
      .filter(file => file.startsWith(this.options.projectRoot) && !/\bnode_modules\b/.test(file));

    let context = new Context(converter, includeFiles, program.getTypeChecker(), program);

    converter.trigger(Converter.EVENT_BEGIN, context);
    converter.compile(context);
    converter.resolve(context);
    converter.trigger(Converter.EVENT_END, context);

    let docs = loadFromReflection(context, this.options);
    let json = Serializer.serialize('module', docs.modules.filter(mod => !mod.file.endsWith('.js')));

    fs.writeJsonSync(outFile, json, { spaces: 2 });
  }
}
launch(new TypedocWorker());
