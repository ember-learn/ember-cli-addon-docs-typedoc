const { ReflectionKind } = require('typedoc');

module.exports = class Module {
  constructor(ref) {
    this.id = ref.name;

    // Attributes
    this.file = ref.name;
    this.functions = [];
    this.helpers = [];
    this.variables = [];

    // Relationships
    this.classes = [];
    this.components = [];
  }

  static detect(ref) {
    return ref && (ref.kind & ReflectionKind.ExternalModule);
  }
}
