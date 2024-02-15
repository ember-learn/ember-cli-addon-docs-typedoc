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
    this.signatures = ref.signatures.map((signature) =>
      this.extractSignature(signature)
    );
  }

  attachToParent(parent) {
    parent.functions.push(this);
  }

  extractDescription(ref) {
    return (
      super.extractDescription(ref) ||
      super.extractDescription(ref.signatures[0])
    );
  }

  extractSignature(signature) {
    let returns = {
      description: signature.comment && signature.comment.returns,
      type: this.typeToString(signature.type),
    };

    let typeParams = (signature.typeParameters || []).map((typeParam) => {
      let constraint = typeParam.type
        ? ` extends ${this.typeToString(typeParam.type)}`
        : '';
      return `${typeParam.name}${constraint}`;
    });

    let params = (signature.parameters || []).map((param) => {
      return {
        name: param.name,
        description: param.description,
        type: this.typeToString(param.type),
        isOptional: param.flags.isOptional || !!param.defaultValue,
        isRest: param.flags.isRest,
      };
    });

    return { params, typeParams, returns };
  }

  typeToString(type) {
    let stringified = type.toString();
    if (stringified.endsWith('_type')) {
      // debugger;
    }
    if (stringified === 'function') {
      let { params, typeParams, returns } = this.extractSignature(
        type.declaration.signatures[0]
      );
      stringified = `(${params
        .map((p) => `${p.name}: ${p.type}`)
        .join(', ')}) => ${returns.type}`;

      if (typeParams.length) {
        stringified = `<${typeParams.join(', ')}>${stringified}`;
      }
    }
    return stringified.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
