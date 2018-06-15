/**
 * @module Store
 * @license MIT
 * @see https://github.com/jamiebuilds/unstated/blob/master/src/unstated.js
 */

import React from 'react';
import { isFunction } from './utils';

const BLACKLIST = ['<state>', '<listeners>', 'state', 'setState', '<listeners>', 'subscribe', 'unsubscribe'];

declare type Updater = React.ComponentState | ((prevState: React.ComponentState) => React.ComponentState);

/**
 * @class Store
 */
export default class Store {
  [key: string]: any;

  private '<state>': React.ComponentState;
  private readonly '<listeners>': Array<() => void> = [];

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
    this['<state>'] = defaultState;
  }

  public get state(): React.ComponentState {
    return this['<state>'];
  }

  /**
   * @method setState
   * @param updater
   * @param callback
   */
  public setState(updater: Updater, callback?: () => void): Promise<void> {
    return Promise.resolve().then(() => {
      const state = this['<state>'];

      if (isFunction(updater)) {
        updater = updater(state);
      }

      if (updater == null) {
        if (isFunction(callback)) {
          return callback();
        }
      } else {
        this['<state>'] = { ...state, ...updater };

        const promises = this['<listeners>'].map(listener => listener());

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
  public subscribe(fn: () => void) {
    if (isFunction(fn)) {
      this['<listeners>'].push(fn);
    }
  }

  /**
   * @method unsubscribe
   * @param fn
   */
  public unsubscribe(fn: () => void) {
    const listeners = this['<listeners>'];
    const index = listeners.indexOf(fn);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
}
