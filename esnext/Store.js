/**
 * @module Store
 * @license MIT
 * @see https://github.com/jamiebuilds/unstated/blob/master/src/unstated.js
 */
import * as tslib_1 from "tslib";
import { isFunction } from './utils';
var BLACKLIST = ['<state>', '<listeners>', 'state', 'setState', '<listeners>', 'subscribe', 'unsubscribe'];
/**
 * @class Store
 */
var Store = /** @class */ (function () {
    /**
     * @constructor
     * @param defaultState
     */
    function Store(defaultState) {
        if (defaultState === void 0) { defaultState = {}; }
        this['<listeners>'] = [];
        this['<state>'] = defaultState;
    }
    /**
     * @function blacklist
     * @param prop
     */
    Store.blacklist = function (prop) {
        return BLACKLIST.indexOf(prop) !== -1;
    };
    Object.defineProperty(Store.prototype, "state", {
        get: function () {
            return this['<state>'];
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @method setState
     * @param updater
     * @param callback
     */
    Store.prototype.setState = function (updater, callback) {
        var _this = this;
        return Promise.resolve().then(function () {
            var state = _this['<state>'];
            if (isFunction(updater)) {
                updater = updater(state);
            }
            if (updater == null) {
                if (isFunction(callback)) {
                    return callback();
                }
            }
            else {
                _this['<state>'] = tslib_1.__assign({}, state, updater);
                var promises = _this['<listeners>'].map(function (listener) { return listener(); });
                return Promise.all(promises).then(function () {
                    if (isFunction(callback)) {
                        return callback();
                    }
                });
            }
        });
    };
    /**
     * @method subscribe
     * @param fn
     */
    Store.prototype.subscribe = function (fn) {
        if (isFunction(fn)) {
            this['<listeners>'].push(fn);
        }
    };
    /**
     * @method unsubscribe
     * @param fn
     */
    Store.prototype.unsubscribe = function (fn) {
        var listeners = this['<listeners>'];
        var index = listeners.indexOf(fn);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    };
    return Store;
}());
export default Store;
