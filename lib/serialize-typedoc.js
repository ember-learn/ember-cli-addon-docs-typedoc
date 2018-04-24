const Module = require('./models/module');
const Class = require('./models/class');

const MODEL_CLASSES = [];

module.exports = function serializeTypedoc(object) {
  let queue = [object];
  let modules = {};
  let classes = {};

  for (let current = queue.shift(); queue.length; current = queue.shift()) {
    if (Module.detect(current)) {
      modules[current.id] = new Module(current);
      queue.push(...current.children);
    } else if (Class.detect(current)) {
      classes[current.id] = new Class(current);
      queue.push(...current.children);
    } else for (let candidate of MODEL_CLASSES) {
      if (candidate.detect(current)) {

        break;
      }
    }
  }
};


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
  helpers: Array<Helper>

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
