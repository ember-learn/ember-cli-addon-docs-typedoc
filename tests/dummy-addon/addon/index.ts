export const FOO = 'hello';

export class Class {
  /**
   * FOO
   */
  get foo() {
    return 'ok'
  }

  /**
   * foo?
   */
  set foo(value: string) {

  }

  /**
   * BAR
   */
  static set bar(value: number) {
    console.log(value);
  }
}
