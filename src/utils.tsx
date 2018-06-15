/**
 * @module util
 * @license MIT
 */

/**
 * @function isFunction
 * @param value
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}
