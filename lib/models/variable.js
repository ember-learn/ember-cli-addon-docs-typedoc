'use strict';

const Entity = require('./-entity');
const { ReflectionKind } = require('typedoc');

module.exports = class Accessor extends Entity {
  static detect(ref) {
    return ref.kind & ReflectionKind.Accessor;
  }

  constructor(parent, ref, options) {
    super(parent, ref, options);

    this.name = ref.name;
    this.type = (ref.getSignature || ref.setSignature.parameters[0]).type.toString();

    this.isStatic = ref.flags.isStatic;
    this.hasGetter = !!ref.getSignature;
    this.hasSetter = !!ref.setSignature;
  }

  attachToParent(parent) {
    parent.accessors.push(this);
  }
}
