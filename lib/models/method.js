'use strict';

const Function = require('./function');
const { ReflectionKind } = require('typedoc');

module.exports = class Method extends Function {
  static detect(ref) {
    return ref.kind & ReflectionKind.Method;
  }

  constructor(parent, ref, options) {
    super(parent, ref, options);

    this.isStatic = ref.flags.isStatic;
  }

  attachToParent(parent) {
    parent.methods.push(this);
  }
}
