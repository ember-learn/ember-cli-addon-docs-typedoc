'use strict';

const fs = require('fs-extra');
const path = require('path');
const Plugin = require('broccoli-plugin');
const { Application } = require('typedoc');
const { Context, Converter } = require('typedoc/dist/lib/converter');
const loadFromReflection = require('./load-from-reflection');
const Serializer = require('./serializer');
const resolve = require('resolve');

module.exports = class DocsGenerator extends Plugin {
  constructor(inputTree, options) {
    super([inputTree]);

    this.project = options.project;
    this.compiler = options.compiler;
    this.destDir = options.destDir;
    this.app = new Application();

    this._verifyTSVersion();
  }

  build() {
    let converter = this.app.converter;
    let program = this.compiler.getProgram().getProgram();
    let includeFiles = program.getSourceFiles()
      .map(source => source.fileName)
      .filter(file => file.startsWith(this.project.root) && !/\bnode_modules\b/.test(file));

    let context = new Context(converter, includeFiles, program.getTypeChecker(), program);
    let outFile = `${this.outputPath}/${this.destDir}/index.json`;

    converter.trigger(Converter.EVENT_BEGIN, context);
    converter.compile(context);
    converter.resolve(context);
    converter.trigger(Converter.EVENT_END, context);

    let docs = loadFromReflection(context, this.project);
    let json = Serializer.serialize('module', docs.modules);

    fs.ensureDirSync(path.dirname(outFile));
    fs.writeJsonSync(outFile, json, { spaces: 2 });

    this.project.ui.writeLine(JSON.stringify(json, null, 2));
  }

  _verifyTSVersion() {
    let typedocLocation = path.dirname(require.resolve('typedoc/package.json'));
    let typedocVersion = require(resolve.sync('typescript/package.json', { basedir: typedocLocation })).version;
    let projectVersion = this.project.require('typescript/package.json').version;
    let resolutionURL = 'https://yarnpkg.com/lang/en/docs/selective-version-resolutions';

    if (typedocVersion !== projectVersion) {
      this.project.ui.writeWarnLine(
        `Your project is using typescript@${projectVersion}, but TypeDoc is loading ` +
        `typescript@${typedocVersion}. This may lead to unexpected or missing documentation. ` +
        `You may want to try setting a version resolution in your package.json to ensure ` +
        `TypeDoc uses the same version as your project. See ${resolutionURL} for details.`
      );
    }
  }
}
