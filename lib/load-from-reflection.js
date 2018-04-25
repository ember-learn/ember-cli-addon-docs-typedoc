'use strict';

const MODEL_CLASSES = [
  require('./models/project'),
  require('./models/module'),
  require('./models/component'),
  require('./models/class'),
  require('./models/field'),
  require('./models/function'),
  require('./models/method'),
  require('./models/variable'),
  require('./models/accessor')
];

module.exports = function loadFromReflection(context, project) {
  let loaded = new Map();
  let options = { context, project, load };

  function load(ref) {
    if (!ref) {
      return ref;
    }

    if (loaded.has(ref)) {
      return loaded.get(ref);
    }

    let found = false;
    for (let ModelClass of MODEL_CLASSES) {
      if (ModelClass.detect(ref)) {
        found = true;

        if (!ModelClass.shouldProcess(ref)) break;
        let model = new ModelClass(load(ref.parent), ref, options);

        loaded.set(ref, model);

        for (let childRef of ref.children || []) {
          load(childRef);
        }

        return model;
      }
    }

    if (!found) {
      project.ui.writeWarnLine('Unable to identify reflection', ref);
    }

    loaded.set(ref, null);
    return null;
  }

  return load(context.project);
}

/*

interface Tag {
  name: string;
  value: string;
}

interface Decorator {
  name: string;
  value: string;
}

interface Param {
  name: string;
  type: string;
  description: string;
}

interface Yield {
  name: string;
  type: string;
  description: string;
}

interface Return {
  type: string;
  description: string;
  properties: Array<Param>
}

interface Variable {
  name: string;
  type: string;
  file: string;
  exportType: string;
  description: string;
  lineNumber: number;
  access: string;

  tags: Array<Tag>;
}

interface Field {
  name: string;
  type: string;
  file: string;
  description: string;
  lineNumber: number;
  access: string;

  isStatic: boolean;
  isRequired: boolean;
  isImmutable: boolean;
  isReadOnly: boolean;

  tags: Array<Tag>;
  decorators: Array<Decorator>;
}

interface Argument extends Field {}

interface Function {
  name: string;
  file: string;
  exportType: string;
  description: string;
  lineNumber: number;
  access: string;

  isAsync: boolean;
  isGenerator: boolean;

  returns: Return;
  params: Array<Param>;
  tags: Array<Tag>;
}

interface Helper extends Function {}

interface Method {
  name: string;
  file: string;
  description: string;
  lineNumber: number;
  access: string;

  isAsync: boolean;
  isGenerator: boolean;
  isStatic: boolean;

  returns: Return;
  params: Array<Param>;
  tags: Array<Tag>;
  decorators: Array<Decorator>
}

interface Accessor {
  name: string;
  type: string;
  file: string;
  description: string;
  lineNumber: number;
  access: string;

  isStatic: boolean;
  hasGetter: boolean;
  hasSetter: boolean;

  tags: Array<Tag>;
  decorators: Array<Decorator>;
}

interface Class {
  id: string;
  name: string;
  file: string;
  exportType: string;
  description: string;
  lineNumber: number;
  access: string;

  isInterface: boolean;

  tags: Array<Tag>;
  decorators: Array<Decorator>;
  fields: Array<Field>;
  methods: Array<Method>;
  accessors: Array<Accesor>;

  parentClass: Class|null;
}

interface Component extends Class {
  arguments: Array<Argument>;
  yields: Array<Yield>;
}

interface Module {
  id: string;
  file: string;

  variables: Array<Variable>
  functions: Array<Function>

  classes: Array<Class>
  components: Array<Component>
}

interface Project {
  name: string;
  githubUrl: string;
  version: string;
  navigationIndex: Object;
  modules: Array<Module>;
}

*/
