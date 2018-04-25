'use strict';

const Entity = require('./-entity');
const { ReflectionKind } = require('typedoc');

// interface Function {
//   name: string;
//   file: string;
//   exportType: string;
//   description: string;
//   lineNumber: number;
//   access: string;
//
//   isAsync: boolean;
//   isGenerator: boolean;
//
//   signatures: Array<Signature>;
//   tags: Array<Tag>;
// }
//
// interface Signature {
//   params: Array<Param>;
//   returns: Return;
// }
//
// interface Param {
//   name: string;
//   type: string;
//   description: string;
// }
//
// interface Return {
//   type: string;
//   description: string;
//   properties: Array<Param>
// }

module.exports = class Function extends Entity {
  static detect(ref) {
    return ref.kind & ReflectionKind.Function;
  }

  static shouldProcess(ref) {
    return super.shouldProcess(ref) && ref.flags.isExported;
  }

  constructor(parent, ref, options) {
    super(parent, ref, options);

    this.name = ref.name;
    this.isAsync = ref.signatures[0].type.name === 'Promise';
    this.isGenerator = ref.signatures[0].type.name === 'IterableIterator';
    this.signatures = ref.signatures.map(signature => this.extractSignature(signature));
  }

  attachToParent(parent) {
    parent.functions.push(this);
  }

  extractDescription(ref) {
    return super.extractDescription(ref) || super.extractDescription(ref.signatures[0]);
  }

  extractSignature(signature) {
    let returns = {
      description: signature.comment && signature.comment.returns,
      type: signature.type.toString()
    };

    let params = (signature.parameters || []).map((param) => {
      return {
        name: param.name,
        description: param.description,
        type: param.type.toString(),
        isOptional: param.flags.isOptional,
        isRest: param.flags.isRest
      };
    });

    return { params, returns };
  }
}
