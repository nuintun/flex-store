/**
 * @module util
 * @license MIT
 */

// Type callback
export type Callback = () => void;

// Default store prop
export const defaultStoreProp: string = 'store';

/**
 * @function isFunction
 * @param value
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

/**
 * @function getVersionProp
 * @param storeProp
 */
export function getVersionProp(storeProp: string = defaultStoreProp): string {
  return `${storeProp}Version`;
}
