'use strict';

const { ReflectionKind } = require('typedoc');
const Entity = require('./-entity');

// interface Module {
//   id: string;
//   file: string;
//
//   variables: Array<Variable>
//   functions: Array<Function>
//
//   classes: Array<Class>
//   components: Array<Component>
// }

module.exports = class Module extends Entity {
  static detect(ref) {
    return ref.kind & ReflectionKind.ExternalModule;
  }

  constructor(parent, ref, options) {
    super(parent, ref, options);

    this.id = this.file;

    this.variables = [];
    this.functions = [];
    this.classes = [];
    this.components = [];
  }

  attachToParent(parent) {
    parent.modules.push(this);
  }
}
