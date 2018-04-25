'use strict';

const Entity = require('./-entity');
const { ReflectionKind } = require('typedoc');

// interface Variable {
//   name: string;
//   type: string;
//   file: string;
//   exportType: string;
//   description: string;
//   lineNumber: number;
//   access: string;
//
//   tags: Array<Tag>;
// }

module.exports = class Variable extends Entity {
  static detect(ref) {
    return ref.kind & ReflectionKind.Variable;
  }

  static shouldProcess(ref) {
    return super.shouldProcess(ref) && ref.flags.isExported;
  }

  constructor(parent, ref, options) {
    super(parent, ref, options);

    this.name = ref.name;
    this.type = ref.type.toString();
  }

  attachToParent(parent) {
    parent.variables.push(this);
  }
}
