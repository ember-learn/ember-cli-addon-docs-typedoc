'use strict';

const resolve = require('resolve');
const path = require('path');
const fs = require('fs-extra');
const { launch } = require('stagehand/lib/adapters/child-process');
const { Application } = require('typedoc');
const { Context, Converter } = require('typedoc/dist/lib/converter');
const loadFromReflection = require('./load-from-reflection');
const Serializer = require('./serializer');
const ensurePosixPath = require('ensure-posix-path');

launch(
  new (class TypedocWorker {
    constructor() {
      this.app = new Application();
      this.compiler = null;
      this.importPathForFile = null;
    }

    start(options) {
      let ts = require(resolve.sync('typescript', {
        basedir: path.dirname(require.resolve('typedoc/package.json')),
      }));
      let configFile = ts.findConfigFile(
        options.projectRoot,
        ts.sys.fileExists,
        'tsconfig.json'
      );
      let host = ts.createWatchCompilerHost(
        configFile,
        {},
        ts.sys,
        ts.createSemanticDiagnosticsBuilderProgram,
        () => {},
        () => {}
      );

      this.packages = options.packages;
      this.watch = ts.createWatchProgram(host);
      this.importPathForFile = makePhysicalToLogicalPathResolver(
        this.watch.getProgram().getProgram().getCompilerOptions()
      );
    }

    emit(outFile) {
      let { converter } = this.app;
      let { importPathForFile } = this;
      let program = this.watch.getProgram().getProgram();
      let context = new Context(
        converter,
        [],
        program.getTypeChecker(),
        program
      );

      converter.trigger(Converter.EVENT_BEGIN, context);
      converter.compile(context);
      converter.resolve(context);
      converter.trigger(Converter.EVENT_END, context);

      let docs = loadFromReflection(context, { importPathForFile });
      let json = Serializer.serialize(
        'module',
        docs.modules.filter((mod) => {
          return (
            mod.file &&
            this.packages.some(
              (pkg) => mod.file === pkg || mod.file.startsWith(`${pkg}/`)
            )
          );
        })
      );

      fs.writeJsonSync(outFile, json, { spaces: 2 });
    }
  })()
);

function makePhysicalToLogicalPathResolver(compilerOptions) {
  let pathsHash = compilerOptions.paths || {};
  let baseUrl = compilerOptions.baseUrl;
  let mappings = Object.create(null);
  for (let logicalPath of Object.keys(pathsHash)) {
    let isGlob = logicalPath.endsWith('*');
    let physicalPaths = pathsHash[logicalPath];
    for (let relativePhysicalPath of physicalPaths) {
      if (relativePhysicalPath.endsWith('/*') !== isGlob) {
        throw new Error(
          `Mismatched path specifier; logical: ${logicalPath}, physical: ${relativePhysicalPath}`
        );
      }

      let physicalPath = path.resolve(baseUrl, relativePhysicalPath);
      if (!mappings[physicalPath]) {
        mappings[physicalPath] = logicalPath;
      }
    }
  }

  return (filePath) => {
    if (!filePath) return;

    let fullPath = ensurePosixPath(filePath).replace(/\.ts$/, '');
    if (fullPath in mappings) {
      return mappings[fullPath];
    }

    if (fullPath.endsWith('/index')) {
      fullPath = fullPath.replace(/\/index$/, '');
      if (fullPath in mappings) {
        return mappings[fullPath];
      }
    }

    let segments = fullPath.split('/');
    do {
      segments.pop();

      let candidate = `${segments.join('/')}/*`;
      if (candidate in mappings) {
        return mappings[candidate].replace(
          /\*$/,
          fullPath.substring(candidate.length - 1)
        );
      }
    } while (segments.length);
  };
}
