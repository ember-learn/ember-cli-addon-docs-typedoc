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
  let loaded = new Map([[null, null], [undefined, undefined]]);
  let options = { context, project, load };

  function load(ref) {
    if (!loaded.has(ref)) {
      let model = instantiateModelFor(ref, options);

      loaded.set(ref, model);

      if (model) {
        for (let childRef of ref.children || []) {
          load(childRef);
        }
      }
    }

    return loaded.get(ref);
  }

  return load(context.project);
}

function instantiateModelFor(ref, options) {
  for (let ModelClass of MODEL_CLASSES) {
    if (ModelClass.detect(ref)) {
      if (ModelClass.shouldProcess(ref)) {
        let parent = options.load(ref.parent);
        return new ModelClass(parent, ref, options);
      } else {
        return null;
      }
    }
  }

  options.project.ui.writeWarnLine('Unable to identify reflection', ref);
  return null;
}
