/**
 * @module Store
 * @license MIT
 * @see https://github.com/jamiebuilds/unstated/blob/master/src/unstated.js
 */
import * as tslib_1 from "tslib";
var BLACKLIST = ['state', 'setState', 'listeners', 'subscribe', 'unsubscribe'];
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
        this.listeners = [];
        this.state = defaultState;
    }
    /**
     * @function blacklist
     * @param prop
     */
    Store.blacklist = function (prop) {
        return BLACKLIST.indexOf(prop) !== -1;
    };
    /**
     * @method setState
     * @param updater
     * @param callback
     */
    Store.prototype.setState = function (updater, callback) {
        var _this = this;
        return Promise.resolve().then(function () {
            var nextState;
            if (typeof updater === 'function') {
                nextState = updater(_this.state);
            }
            else {
                nextState = updater;
            }
            if (nextState == null) {
                if (callback) {
                    return callback();
                }
            }
            _this.state = tslib_1.__assign({}, _this.state, nextState);
            var promises = _this.listeners.map(function (listener) { return listener(); });
            return Promise.all(promises).then(function () {
                if (callback) {
                    return callback();
                }
            });
        });
    };
    /**
     * @method subscribe
     * @param fn
     */
    Store.prototype.subscribe = function (fn) {
        this.listeners.push(fn);
    };
    /**
     * @method unsubscribe
     * @param fn
     */
    Store.prototype.unsubscribe = function (fn) {
        var index = this.listeners.indexOf(fn);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    };
    return Store;
}());
export default Store;
