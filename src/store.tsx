/**
 * @module store
 * @license MIT
 */

export interface Store {
  state: Readonly<Object>;
  subscribe(listener: () => void): () => void;
  setState(
    updater: Readonly<Object> | ((prevState: Readonly<Object>) => Readonly<Object>),
    callback?: () => void
  ): void;
}

/**
 * @function create
 * @param {Object} defaultState
 * @returns {Object}
 */
export function create(defaultState: Object = {}): Store {
  const listeners: Function[] = [];
  let state: Object = defaultState;

  return {
    /**
     * @property state
     */
    get state(): Object {
      return state;
    },
    /**
     * @method subscribe
     * @param {Function} listener
     * @returns {Function}
     */
    subscribe(listener: () => void): () => void {
      listeners.push(listener);

      return function unsubscribe(): void {
        const index = listeners.indexOf(listener);

        if (index !== -1) listeners.splice(index, 1);
      };
    },
    /**
     * @method setState
     * @param {Function} [callback]
     */
    setState(updater: {} | Function, callback?: () => void): void {
      if (typeof updater === 'function') {
        updater = updater(state);
      }

      state = { ...state, ...updater };

      for (let index = 0; index < listeners.length; index++) {
        listeners[index](state, callback);
      }
    }
  };
}
