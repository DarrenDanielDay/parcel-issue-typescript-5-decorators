# 🐛 bug report

The decorator metadata introduced in TypeScript 5.2 crashes in production build with optimization enabled. Perhaps same issue with #8989.

## 🎛 Configuration (.babelrc, package.json, cli command)

Detailed configuration can be found in the minimum example to reproduce:

<https://github.com/DarrenDanielDay/parcel-issue-typescript-5-decorators>

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.{ts,tsx}": ["@parcel/transformer-typescript-tsc"]
  }
}
```

## 🤔 Expected Behavior

The decorators code in production build with optimization works as it is in serve mode.

## 😯 Current Behavior

The decorators code in production build runs into the following error:

```txt
Uncaught TypeError: Function expected
    at r (index.0cb3d518.js:1:110)
    at e (index.0cb3d518.js:1:811)
    at index.0cb3d518.js:2:358
    at index.0cb3d518.js:2:539
    at index.0cb3d518.js:2:545
```

## 💁 Possible Solution

See below.

```js
// part of code in parcel serve
Symbol.metadata ??= Symbol("Symbol.metadata");
const CustomElement = (tag)=>{
    return (ctor, context)=>{
        context.addInitializer(function() {
            customElements.define(tag, this);
            console.log("metadata:", context.metadata);
        });
        return ctor;
    };
};
let A = (()=>{
    let _classDecorators = [
        CustomElement("component-a")
    ];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLElement;
    var A = class extends _classSuper {
        static #_ = (()=>{
            _classThis = this;
        })();
        static #_1 = (()=>{
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = {
                value: _classThis
            }, _classDecorators, {
                kind: "class",
                name: _classThis.name,
                metadata: _metadata
            }, null, _classExtraInitializers);
            A = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: _metadata
            });
            __runInitializers(_classThis, _classExtraInitializers);
        })();
        constructor(){
            super();
            this.innerHTML = "Component A is working";
        }
    };
    return A = _classThis;
})();
console.log(new A().tagName);
```

```js
// part of code in parcel build
Symbol.metadata ??= Symbol("Symbol.metadata");
const a = (e) => (t, a) => (
  a.addInitializer(function () {
    customElements.define(e, this), console.log("metadata:", a.metadata);
  }),
  t
);
console.log(
  new ((() => {
    let n,
      o,
      i = [a("component-a")],
      r = [],
      l = HTMLElement;
    // also missing class body and `this` context for class static initializers
    return (
      (() => {
        o = this;
      })(),
      (() => {
        let a = "function" == typeof Symbol && Symbol.metadata ? Object.create(l[Symbol.metadata] ?? null) : void 0;
        e(null, (n = { value: o }), i, { kind: "class", name: o.name, metadata: a }, null, r),
          (o = n.value),
          a && Object.defineProperty(o, Symbol.metadata, { enumerable: !0, configurable: !0, writable: !0, value: a }),
          t(o, r);
      })(),
      o
    );
  })())().tagName
);
```

## 🔦 Context

Same behavior with #8989 but with different versions of `parcel` and `typescript`.

## 💻 Code Sample

<https://github.com/DarrenDanielDay/parcel-issue-typescript-5-decorators>

## 🌍 Your Environment

| Software         | Version(s) |
| ---------------- | ---------- |
| Parcel           | 2.9.3
| Node             | 18.12.1
| npm/Yarn         | 9.1.2
| Operating System | Windows 10

