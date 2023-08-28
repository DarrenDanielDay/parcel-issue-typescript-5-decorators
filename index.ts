// @ts-ignore assign to readonly property as polyfill
Symbol.metadata ??= Symbol("Symbol.metadata");

const CustomElement = (tag: string) => {
  return <T extends new () => HTMLElement>(ctor: T, context: ClassDecoratorContext<T>) => {
    context.addInitializer(function () {
      customElements.define(tag, this);
      console.log("metadata:", context.metadata);
    });
    return ctor;
  };
};

@CustomElement("component-a")
class A extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = "Component A is working";
  }
}

console.log(new A().tagName);
