/**
 * @module util
 * @license MIT
 */

// Type callback
export type Callback = () => void;

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
