'use strict';

const Entity = require('./-entity');
const { ReflectionKind } = require('typedoc');

module.exports = class Class extends Entity {
  static detect(ref) {
    return ref.kind & (ReflectionKind.Class | ReflectionKind.Interface);
  }

  constructor(parent, ref, options) {
    super(parent, ref, options);
    this.name = ref.name;
    this.id = `${this.file}~${this.name}`;

    this.isInterface = !!(ref.kind & ReflectionKind.Interface);
    this.parentClass = this.determineParentClass(ref, options);

    this.fields = [];
    this.methods = [];
    this.accessors = [];
  }

  attachToParent(parent) {
    parent.classes.push(this);
  }

  determineParentClass(ref, options) {
    let previous = null;
    let current = ref.typeHierarchy;

    while (current) {
      let maybeRef = current.types.find(type => type.reflection === ref);
      if (maybeRef) {
        if (previous) {
          return options.load(previous.types[0].reflection);
        } else {
          return null;
        }
      }

      previous = current;
      current = current.next;
    }
  }
}
