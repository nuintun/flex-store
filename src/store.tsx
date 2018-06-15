/**
 * @module Store
 * @license MIT
 * @see https://github.com/jamiebuilds/unstated/blob/master/src/unstated.js
 */

import * as React from 'react';
import { isFunction } from './utils';

// Props blacklist
const BLACKLIST = ['state', 'setState', 'subscribe', 'unsubscribe'];

export declare type StateUpdater = React.ComponentState | ((prevState: React.ComponentState) => React.ComponentState);

/**
 * @class Store
 */
export default class Store {
  public state: React.ComponentState;
  private readonly listeners: Array<() => void> = [];

  /**
   * @function blacklist
   * @param prop
   */
  static blacklist(prop: string): boolean {
    return BLACKLIST.indexOf(prop) !== -1;
  }

  /**
   * @constructor
   * @param defaultState
   */
  constructor(defaultState: React.ComponentState = {}) {
    this.state = defaultState;
  }

  /**
   * @method setState
   * @param updater
   * @param callback
   */
  public setState(updater: StateUpdater, callback?: () => void): Promise<void> {
    return Promise.resolve().then(() => {
      const state = this.state;

      if (isFunction(updater)) {
        updater = updater(state);
      }

      if (updater == null) {
        if (isFunction(callback)) {
          return callback();
        }
      } else {
        this.state = { ...state, ...updater };

        const promises = this.listeners.map(listener => listener());

        return Promise.all(promises).then(() => {
          if (isFunction(callback)) {
            return callback();
          }
        });
      }
    });
  }

  /**
   * @method subscribe
   * @param fn
   */
  public subscribe(fn: () => void): void {
    if (isFunction(fn)) {
      this.listeners.push(fn);
    }
  }

  /**
   * @method unsubscribe
   * @param fn
   */
  public unsubscribe(fn: () => void): void {
    const listeners = this.listeners;
    const index = listeners.indexOf(fn);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
}
