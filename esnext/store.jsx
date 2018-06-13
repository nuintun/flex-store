/**
 * @module store
 * @license MIT
 */
import * as tslib_1 from "tslib";
/**
 * @function create
 * @param {Object} defaultState
 * @returns {Object}
 */
export function create(defaultState) {
    if (defaultState === void 0) { defaultState = {}; }
    var listeners = [];
    var state = defaultState;
    return {
        /**
         * @property state
         */
        get state() {
            return state;
        },
        /**
         * @method subscribe
         * @param {Function} listener
         * @returns {Function}
         */
        subscribe: function (listener) {
            listeners.push(listener);
            return function unsubscribe() {
                var index = listeners.indexOf(listener);
                listeners.splice(index, 1);
            };
        },
        /**
         * @method setState
         * @param {Object|Function} updater
         * @param {Function} [callback]
         */
        setState: function (updater, callback) {
            if (typeof updater === 'function') {
                updater = updater(state);
            }
            state = tslib_1.__assign({}, state, updater);
            for (var index = 0; index < listeners.length; index++) {
                listeners[index](state, callback);
            }
        }
    };
}
