'use strict';

const Function = require('./function');
const { ReflectionKind } = require('typedoc');

// interface Method {
//   name: string;
//   file: string;
//   description: string;
//   lineNumber: number;
//   access: string;
//
//   isAsync: boolean;
//   isGenerator: boolean;
//   isStatic: boolean;
//
//   returns: Return;
//   params: Array<Param>;
//   tags: Array<Tag>;
//   decorators: Array<Decorator>
// }

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
