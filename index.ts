export declare function enumValues<T>(): Array<T>;

export declare function isNull(value: any): value is null;
export declare function isUndefined(value: any): value is undefined;
export declare function isNullOrUndefined(value: any): value is null | undefined;
export declare function isNumber(value: any): value is number;
export declare function isBoolean(value: any): value is boolean;
export declare function isString(value: any): value is string;
export declare function isFunction(value: any): value is Function;
export declare function isSymbol(value: any): value is symbol;

export declare function isPrimitive(value: any): value is number|boolean|string;

export declare function isArray(value: any): value is Array<any>;

/***
 * Returns whether the given value is a not-null object that is also not an array.
 *
 * @param value
 */
export declare function isObject<T extends object = object>(value: any): value is T;

export declare function isObjectOrArray(value: any): value is object | Array<any>;

export declare function isIterable(value: any): value is Iterable<any>;

/***
 * Returns whether the given value is an array of at least a specific number of items.
 *
 * @param value
 * @param {Number} [length = 1]
 */
export declare function isMinLengthArray(value: any, length?: number): value is Array<any>;

/***
 * Returns whether the given value is a non empty string.
 *
 * @param value
 */
export declare function isNonEmptyString(value: any): value is string;

/***
 * Returns whether the given value is a string with a minimum length.
 *
 * @param value
 * @param {Number} [length = 1]
 */
export declare function isMinLengthString(value: any, length?: number): value is string;


export declare function isBitSet<T extends number>(value: T, bitmask: T): boolean;
export declare function setBits<T extends number>(value: T, bitmask: T): T;
export declare function unsetBits<T extends number>(value: T, bitmask: T): T;
