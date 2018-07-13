/**
 * @module util
 * @license MIT
 */

// Type callback
export declare type Callback = (...arge: any[]) => void;

/**
 * @function isFunction
 * @param value
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

// UID
let uid = 0;

/**
 * @function generateStoreName
 */
export function generateStoreName(): string {
  return (Date.now() ^ Math.random() ^ uid++).toString(32);
}

/**
 * @function is
 * @param x
 * @param y
 * @description inlined Object.is polyfill to avoid requiring consumers ship their own
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x: any, y: any): boolean {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
  }
}

// Object hasOwnProperty
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @function shallowEqual
 * @param objectA
 * @param objectB
 * @description
 *   Performs equality by iterating through keys on an object and returning false
 *   when any key has values which are not strictly equal between the arguments.
 *   Returns true when the values of all keys are strictly equal.
 * @see https://github.com/facebook/react/blob/master/packages/shared/shallowEqual.js
 */
export function shallowEqual(objectA: any, objectB: any): boolean {
  if (is(objectA, objectB)) {
    return true;
  }

  if (typeof objectA !== 'object' || objectA === null || typeof objectB !== 'object' || objectB === null) {
    return false;
  }

  const keysA = Object.keys(objectA);
  const keysB = Object.keys(objectB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty.call(objectB, keysA[i]) || !is(objectA[keysA[i]], objectB[keysA[i]])) {
      return false;
    }
  }

  return true;
}
