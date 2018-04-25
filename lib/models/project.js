'use strict';

const { ReflectionKind } = require('typedoc');

module.exports = class Project {
  static detect(ref) {
    return ref.kind === ReflectionKind.Global;
  }

  static shouldProcess() {
    return true;
  }

  constructor(parent, ref) {
    this.name = ref.name;
    this.modules = [];
  }
}
