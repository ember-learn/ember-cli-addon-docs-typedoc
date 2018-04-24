const generateID = require('../utils/generate-id');
const { ReflectionKind } = require('typedoc');

module.exports = class Class {
  constructor(ref) {
    this.id = generateID(ref);

    this.name = ref.name;

  }

  static detect(ref) {
    return ref && (ref.kind & ReflectionKind.Class);
  }
}
