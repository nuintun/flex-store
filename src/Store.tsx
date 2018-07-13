/**
 * @module Store
 * @license MIT
 */

import * as React from 'react';
import { Callback, isFunction, shallowEqual } from './utils';

export declare type StoreState = Readonly<React.ComponentState>;
export declare type StoreSubscriber = (state: StoreState) => void;
export declare type StoreUpdater = StoreState | ((prevState: StoreState) => StoreState);
export declare type StoreWatcher = (updater: StoreUpdater, callback?: Callback) => void;

/**
 * @class Store
 */
export default class Store {
  public state: StoreState;
  private readonly watchers: Array<StoreWatcher> = [];
  private readonly subscribers: Array<StoreSubscriber> = [];

  /**
   * @constructor
   * @param initialState
   */
  constructor(initialState: StoreState = {}) {
    this.state = initialState;
  }

  /**
   * @method setState
   * @param updater
   * @param callback
   */
  public setState(updater: StoreUpdater, callback?: Callback): void {
    const stateUpdater = (): StoreState | null => {
      const { state } = this;

      // Exec function updater
      if (isFunction(updater)) {
        updater = updater(state);
      }

      // If updater is null or undefined return null
      if (updater == null) {
        return null;
      }

      // Assign state
      const nextState = { ...state, ...updater };

      // If state shallow equal next state
      if (shallowEqual(state, nextState)) {
        return null;
      }

      // Notify subscribers with nextState
      this.subscribers.forEach(subscriber => subscriber(nextState));

      // Update state
      this.state = nextState;

      // Return nextState
      return nextState;
    };

    // Notify watchers
    this.watchers.forEach(watcher => watcher(stateUpdater, callback));
  }

  /**
   * @method watch
   * @param fn
   */
  public watch(fn: StoreWatcher): void {
    if (isFunction(fn)) {
      this.watchers.push(fn);
    }
  }

  /**
   * @method unwatch
   * @param fn
   */
  public unwatch(fn: StoreWatcher): void {
    const { watchers } = this;
    const index = watchers.indexOf(fn);

    // Delete fn
    if (index !== -1) {
      watchers.splice(index, 1);
    }
  }

  /**
   * @method subscribe
   * @param fn
   */
  public subscribe(fn: StoreSubscriber): void {
    if (isFunction(fn)) {
      this.subscribers.push(fn);
    }
  }

  /**
   * @method unsubscribe
   * @param fn
   */
  public unsubscribe(fn: StoreSubscriber): void {
    const { subscribers } = this;
    const index = subscribers.indexOf(fn);

    // Delete fn
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  }
}
