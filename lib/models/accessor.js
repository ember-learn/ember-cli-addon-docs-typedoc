'use strict';

const Entity = require('./-entity');
const { ReflectionKind } = require('typedoc');

module.exports = class Variable extends Entity {
  static detect(ref) {
    return ref.kind & ReflectionKind.Variable;
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
