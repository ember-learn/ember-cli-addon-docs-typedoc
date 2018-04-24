declare module 'ember-load-initializers' {
  import Application from '@ember/application';

  export default function(app: typeof Application, modulePrefix: string): void;
}
