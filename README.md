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
  isArray, isObject, isObjectOrArray,
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
```

## How to use this transformer

**Using @vendredix/ts-transformer's compiler interface**. See [tests/tsconfig.json](tests/tsconfig.json) for an example.

Update your `tsconfig.json` as follows and compile with `tstc <tsconfig.json>` or use `compileByConfig` of [compiler.ts](compiler.ts). 
```json
{
  "compilerOptions": {},
  "vendredix": {
    "ts-transformers": {
      "plugins": [
        { "transform": "@vendredix/ts-transformers/transformer", "kind": ["before"] }
      ]
    }
  }
}
```

plugin entries described in PluginConfig:

```typescript
export interface CompilerConfig {
  sourceMapSupport?: boolean;
  plugins?: PluginConfig[];
}
export declare const enum PluginType {
  ProgramBuilder = "builder",
  Program = "program"
}
export declare const enum TransformerKind {
  Before = "before",
  After = "after",
  AfterDeclaration = "afterDeclaration"
}
export interface PluginConfig {
  transform: string;
  import?: string; // whenever it should be a specific exported function
  kind?: TransformerKind[]; // default ["after"]
  type?: PluginType; // default "program"
  [options: string]: unknown;
}
```

**Or using [ttypescript](https://github.com/cevek/ttypescript)**. See their repository for more information.
```json
{
    "compilerOptions": {
        "plugins": [
            { "transform": "@vendredix/ts-transformers/transformer", "type": "program" }
        ]
    }
}
```


# License

[MIT](LICENSE)

