import {
  enumValues,
  isNull, isUndefined, isNullOrUndefined,
  isBoolean, isNumber, isString, isFunction, isSymbol,
  isPrimitive,
  isArray, isObject, isObjectOrArray,
  isIterable,
  isMinLengthArray,
  isNonEmptyString, isMinLengthString,
  isBitSet, setBits, unsetBits,
} from "../index";

declare const enum Permissions {
  READ = 1,
  WRITE = 2,
  READ_WRITE = READ | WRITE,
}

declare const enum Types {
  TEXT = "text",
  INTEGER = "integer",
}

const permissions = enumValues<Permissions>();
const types = enumValues<Types>();

const sym = Symbol("test");
let value: any;

if (isNull(value)) {
  console.log(value); // value is null
}
if (isUndefined(value)) {
  console.log(value); // value is undefined
}
if (isNullOrUndefined(value)) {
  console.log(value); // value is null | undefined
}
if (isNumber(value)) {
  console.log(value + 123); // value is a number
}
if (isBoolean(value)) {
  console.log(value === false); // value is a boolean
}
if (isString(value)) {
  console.log(value.substr(1)); // value is a string
}
if (isFunction(value)) {
  console.log(value()); // value is a function
}

if (isPrimitive(value)) {
  console.log(value); // value is number | boolean | string;
}

if (isArray(value)) {
  console.log(value.join(", ")); // value is Array<any>
  const stringValues = value.filter<string>(isString);
}
if (isObject(value)) {
  console.log(value.hasOwnProperty("prop")); // value is an object and not null
}

if (isMinLengthArray(value)) {
  console.log(value.length >= 1);
}
if (isMinLengthArray(value, 2) || isObject(value)) {
  console.log(value);
}

if (isObjectOrArray(value)) {
  console.log(value);
}

if (isIterable(value)) {
  console.log(value);
}

if (isNonEmptyString(value)) {
  console.log(value);
}

if (isSymbol(value)) {
  console.log(value.description);
}

(function () {
  let value: Permissions = Permissions.READ;
  console.log("Read: " + isBitSet(value, Permissions.READ));
  console.log("Write: " + isBitSet(value, Permissions.WRITE));

  console.log("\nsetting WRITE");
  value = setBits(value, Permissions.WRITE);
  console.log("Read: " + isBitSet(value, Permissions.READ));
  console.log("Write: " + isBitSet(value, Permissions.WRITE));

  console.log("\nunsetting READ");
  value = unsetBits(value, Permissions.READ);
  console.log("Read: " + isBitSet(value, Permissions.READ));
  console.log("Write: " + isBitSet(value, Permissions.WRITE));

  value = updateRead(setBits);
  value = updateRead(unsetBits);
  const foo = updateRead(isBitSet);

  function updateRead(method) {
    return method(value, Permissions.READ);
  }
})();
