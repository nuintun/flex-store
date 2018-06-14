/**
 * @module Store
 * @license MIT
 * @see https://github.com/jamiebuilds/unstated/blob/master/src/unstated.js
 */

type Updater = React.ComponentState | ((prevState: React.ComponentState) => React.ComponentState);

const BLACKLIST = ['state', 'setState', 'listeners', 'subscribe', 'unsubscribe'];

/**
 * @class Store
 */
export default class Store {
  [key: string]: any;

  state: React.ComponentState;

  readonly listeners: Array<() => void> = [];

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
  setState(updater: Updater, callback?: () => void): Promise<void> {
    return Promise.resolve().then(() => {
      let nextState;

      if (typeof updater === 'function') {
        nextState = updater(this.state);
      } else {
        nextState = updater;
      }

      if (nextState == null) {
        if (callback) {
          return callback();
        }
      }

      this.state = { ...this.state, ...nextState };

      const promises = this.listeners.map(listener => listener());

      return Promise.all(promises).then(() => {
        if (callback) {
          return callback();
        }
      });
    });
  }

  /**
   * @method subscribe
   * @param fn
   */
  subscribe(fn: () => void) {
    this.listeners.push(fn);
  }

  /**
   * @method unsubscribe
   * @param fn
   */
  unsubscribe(fn: () => void) {
    const index = this.listeners.indexOf(fn);

    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
}
