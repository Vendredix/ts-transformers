# ts-transformers

[![npm](https://img.shields.io/npm/v/@vendredix/ts-transformers.svg)](@vendredix/ts-transformers)
[![npm](https://img.shields.io/npm/dm/@vendredix/ts-transformers.svg)](@vendredix/ts-transformers)

A TypeScript transformer that allows you to extract all values of constant enumurations declarations.

# How to use this package

## Installation
Install the module as a dev dependency.
```
npm i -D @vendredix/ts-transformers
```

## How to use `enumValues`

```ts
import {enumValues} from "@vendredix/ts-transformers";

declare const enum Permissions {
  READ = 1,
  WRITE = 2,
  READ_WRITE = READ | WRITE,
}

declare const enum Types {
  TEXT = "text",
  INTEGER = "integer",
}

const permissions = enumValues<Permissions>(); // [1, 2, 3];
const types = enumValues<Types>(); // ["text", "integer"];
```

## How to use type guard functions

```ts
import {
  isNull, isUndefined, isNullOrUndefined,
  isBoolean, isNumber, isString, isFunction,
  isPrimitive,
  isArray, isObject, isMinLengthArray,
} from "@vendredix/ts-transformers";

let value: any;

if (isNullOrUndefined(value)) {
  // (value === null || value === undefined)
  // value is null | undefined
}

if (isFunction(value)) {
  // (typeof value === "function")
  // value is a function
}

if (isPrimitive(value)) {
  // (typeof value === "number" || typeof value === "boolean" || typeof value === "string")
  // value is number | boolean | string;
}

if (isObject(value)) {
  // (typeof value === "object" && value !== null && !Array.isArray(value))
  // value is an object and not null
}
if (isMinLengthArray(value, 2)) {
  // value is an array and value.length >= 2
}
```

## How to use a transformer
See [compiler.js](tests/compiler.js) for an example.

## Similar work
This transformer is based on work by kimamula.
Check out kimamula's awesome transformers.
* [ts-transformer-enumerate](https://github.com/kimamula/ts-transformer-enumerate)
* [ts-transformer-keys](https://github.com/kimamula/ts-transformer-keys) 

# License

[MIT](LICENSE)

