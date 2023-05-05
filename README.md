# 🐛 bug report

The ECMA Decorators introduced in TypeScript 5.0 crashes in production build with optimization enabled.

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
    at s (index.61afe2c3.js:1:121)
    at __esDecorate (index.61afe2c3.js:1:831)
    at index.ts:11:1
    at index.61afe2c3.js:1:1354
    at index.ts:11:7
```

## 💁 Possible Solution

It's possibly a bug of the optimizer. It seems the optimizer will omit class private static field initialization, leaving it as a simple `arrow function IIFE`, and `this` context in arrow function will be scoped to `wnidow`.

```js
// part of code in parcel serve
const CustomElement = (tag)=>{
    return (ctor, context)=>{
        context.addInitializer(function() {
            customElements.define(tag, this);
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
    var A = class extends HTMLElement {
        static #_ = (()=>{
//      ^^^^^^^^^ seems to be removed in optimized code
            __esDecorate(null, _classDescriptor = {
                value: this
            }, _classDecorators, {
                kind: "class",
                name: this.name
            }, null, _classExtraInitializers);
            A = _classThis = _classDescriptor.value;
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
const CustomElement = e=>(t,n)=>(n.addInitializer((function() {
    customElements.define(e, this)
}
)),
t);
let A = (()=>{
    let e, t, n = [CustomElement("component-a")], i = [];
    HTMLElement,
//  ^^^^^^^^^^^ Is it "class extends HTMLElement"? Even the entire class body has been omitted...
    (()=>{
        __esDecorate(null, e = {
            value: this
//                 ^^^^ "this" is the window object, leading to the error
        }, n, {
            kind: "class",
            name: this.name
        }, null, i),
        t = e.value,
        __runInitializers(t, i)
    }
    )();
    return t
}
)();
console.log((new A).tagName);
```

## 🔦 Context

I'm trying to use the ECMA Decorators introduced in TypeScript 5.0 with parcel. It seems parcel does not support new decorators in TypeScript 5.0 currently, so I added `@parcel/transformer-typescript-tsc` for the decorator syntax without `experimentalDecorators` enabled.

It works well with `parcel serve`, but the code in production build crashes when optimization is enabled (by default). I tried to disable optimization with `--no-optimize`, and the code in production build worked well, but publishing build without optimization is discouraged.

## 💻 Code Sample

<https://github.com/DarrenDanielDay/parcel-issue-typescript-5-decorators>

## 🌍 Your Environment

| Software         | Version(s) |
| ---------------- | ---------- |
| Parcel           | 2.8.3
| Node             | 18.12.1
| npm/Yarn         | 9.1.2
| Operating System | Windows 10

