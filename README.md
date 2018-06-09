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

## How to use a transformer
See [compiler.js](tests/compiler.js) for an example.

## Similar work
This transformer is based on work by kimamula.
Check out kimamula's awesome transformers.
* [ts-transformer-enumerate](https://github.com/kimamula/ts-transformer-enumerate)
* [ts-transformer-keys](https://github.com/kimamula/ts-transformer-keys) 

# License

[MIT](LICENSE)

