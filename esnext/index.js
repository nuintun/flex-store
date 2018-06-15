/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */
import * as tslib_1 from "tslib";
import React from 'react';
import Store from './store';
import { isFunction } from './utils';
/**
 * @function create
 * @param defaultState
 * @param updater
 */
export function create(defaultState, updater) {
    var store = new Store(defaultState);
    for (var prop in updater) {
        if (updater.hasOwnProperty(prop) && !Store.blacklist(prop)) {
            var method = updater[prop];
            store[prop] = isFunction(method) ? method.bind(store) : method;
        }
    }
    return { store: store, context: React.createContext({ store: store, mounted: false }) };
}
/**
 * @function mount
 * @param store
 * @param mapToProp
 */
export function mount(_a, mapToProp) {
    var store = _a.store, context = _a.context;
    if (mapToProp === void 0) { mapToProp = 'store'; }
    return function (Component) {
        var StoreProvider = /** @class */ (function (_super) {
            tslib_1.__extends(StoreProvider, _super);
            function StoreProvider() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = {
                    store: store,
                    mounted: true
                };
                _this.storeUpdater = function () {
                    _this.setState({ store: store });
                };
                return _this;
            }
            StoreProvider.prototype.componentDidMount = function () {
                store.subscribe(this.storeUpdater);
            };
            StoreProvider.prototype.componentWillUnmount = function () {
                store.unsubscribe(this.storeUpdater);
            };
            StoreProvider.prototype.render = function () {
                var _a;
                var state = this.state;
                var Provider = context.Provider;
                var _b = this.props, forwardRef = _b.forwardRef, rest = tslib_1.__rest(_b, ["forwardRef"]);
                var props = tslib_1.__assign({}, rest, (_a = {}, _a[mapToProp] = state, _a));
                return (React.createElement(Provider, { value: state },
                    React.createElement(Component, tslib_1.__assign({}, props, { ref: forwardRef }))));
            };
            return StoreProvider;
        }(React.Component));
        return React.forwardRef(function (props, ref) {
            return React.createElement(StoreProvider, tslib_1.__assign({}, props, { forwardRef: ref }));
        });
    };
}
/**
 * @function connect
 * @param store
 * @param mapToProp
 */
export function connect(store, mapToProp) {
    if (mapToProp === void 0) { mapToProp = 'store'; }
    return function (Component) {
        var StoreConsumer = /** @class */ (function (_super) {
            tslib_1.__extends(StoreConsumer, _super);
            function StoreConsumer() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.renderComponent = function (state) {
                    var _a;
                    if (!state.mounted) {
                        throw new ReferenceError("Store <" + mapToProp + "> provider not yet mounted on the parent or current component");
                    }
                    var _b = _this.props, forwardRef = _b.forwardRef, rest = tslib_1.__rest(_b, ["forwardRef"]);
                    var props = tslib_1.__assign({}, rest, (_a = {}, _a[mapToProp] = state.store, _a));
                    return React.createElement(Component, tslib_1.__assign({}, props, { ref: forwardRef }));
                };
                return _this;
            }
            StoreConsumer.prototype.render = function () {
                var Consumer = store.context.Consumer;
                return React.createElement(Consumer, null, this.renderComponent);
            };
            return StoreConsumer;
        }(React.Component));
        return React.forwardRef(function (props, ref) {
            return React.createElement(StoreConsumer, tslib_1.__assign({}, props, { forwardRef: ref }));
        });
    };
}
