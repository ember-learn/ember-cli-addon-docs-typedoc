'use strict';

module.exports = class Entity {
  static detect() {
    throw new Error('Entity subclasses must implement `detect`');
  }

  static shouldProcess(ref) {
    return !ref.inheritedFrom;
  }

  constructor(parent, ref, options) {
    this.attachToParent(parent, ref);

    this.file = this.extractFile(ref, options);
    this.lineNumber = this.extractLine(ref, options);
    this.description = this.extractDescription(ref, options);
    this.access = this.extractAccess(ref, options);

    this.tags = (ref.comment && ref.comment.tags || []).map(tag => this.extractTag(tag));

    if (ref.decorators) {
      this.decorators = ref.decorators.map(decorator => this.extractDecorator(decorator));
    }

    if (parent instanceof require('./module')) {
      this.exportType = this.determineExportType(ref, options);
    }
  }

  attachToParent() {
    throw new Error('Entity subclasses must implement `attachToParent`');
  }

  extractFile(ref, { projectRoot, projectName }) {
    let fullPath = ref.sources[0].file.fullFileName;
    let relativePath = fullPath.substring(projectRoot.length + 1);
    return relativePath
      .replace(/^(addon\/)?/, `${projectName}/`)
      .replace(/\.ts$/, '')
      .replace(/\/index$/, '');
  }

  extractLine(ref) {
    return ref.sources[0].line;
  }

  extractDescription(ref) {
    if (!ref.comment) return null;

    let segments = [ref.comment.shortText, ref.comment.text];
    return segments.filter(Boolean).join('\n\n');
  }

  extractAccess(ref) {
    if (ref.flags.isPrivate || !ref.flags.isExported) {
      return 'private';
    } else if (ref.flags.isProtected) {
      return 'protected';
    } else {
      return 'public';
    }
  }

  determineExportType(ref, { context }) {
    let sourcePath = ref.sources[0].file.fullFileName.toLowerCase();
    let sourceFile = context.program.getSourceFileByPath(sourcePath);
    let exportSymbols = context.checker.getExportsOfModule(sourceFile.symbol);
    let symbolMapping = context.project.symbolMapping;

    for (let exportSymbol of exportSymbols) {
      if (symbolMapping[exportSymbol.id] === ref.id) {
        if (exportSymbol.escapedName === 'default') {
          return 'default';
        } else {
          return 'named';
        }
      }
    }

    return 'none';
  }

  extractTag(tag) {
    return { name: tag.tagName, value: tag.text };
  }

  extractDecorator(decorator) {
    return {
      name: decorator.name
      // TODO TypeDoc handles decorator arguments strangely
    };
  }
}
