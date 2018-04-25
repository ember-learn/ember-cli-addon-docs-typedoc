'use strict';

const Entity = require('./-entity');
const { ReflectionKind } = require('typedoc');

module.exports = class Field extends Entity {
  static detect(ref) {
    return ref.kind & ReflectionKind.Property;
  }

  constructor(parent, ref, options) {
    super(parent, ref, options);

    this.name = ref.name;
    this.type = ref.type.toString();

    this.isStatic = ref.flags.isStatic;
    this.isRequired = !ref.defaultValue;
  }

  attachToParent(parent) {
    parent.fields.push(this);
  }
}
