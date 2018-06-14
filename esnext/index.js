/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */
import * as tslib_1 from "tslib";
import React from 'react';
import Store from './Store';
/**
 * @function create
 * @param defaultState
 * @param updater
 */
export function create(defaultState, updater) {
    var store = new Store(defaultState);
    for (var method in updater) {
        if (updater.hasOwnProperty(method) && !Store.blacklist(method)) {
            store[method] = updater[method];
        }
    }
    return { store: store, context: React.createContext(defaultState) };
}
/**
 * @function mount
 * @param param0
 * @param mountToProp
 */
export function mount(_a, mountToProp) {
    var store = _a.store, context = _a.context;
    if (mountToProp === void 0) { mountToProp = 'store'; }
    return function (Component) {
        var StoreProvider = /** @class */ (function (_super) {
            tslib_1.__extends(StoreProvider, _super);
            function StoreProvider() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { store: store };
                _this.updater = function () {
                    _this.setState({ store: store });
                };
                return _this;
            }
            StoreProvider.prototype.componentDidMount = function () {
                store.subscribe(this.updater);
            };
            StoreProvider.prototype.componentWillUnmount = function () {
                store.unsubscribe(this.updater);
            };
            StoreProvider.prototype.render = function () {
                var _a;
                var Provider = context.Provider;
                var value = this.state.store;
                var props = tslib_1.__assign({}, this.props, (_a = {}, _a[mountToProp] = value, _a));
                return (React.createElement(Provider, { value: value },
                    React.createElement(Component, tslib_1.__assign({}, props))));
            };
            return StoreProvider;
        }(React.Component));
        return React.forwardRef(function (props, ref) {
            return React.createElement(StoreProvider, tslib_1.__assign({}, props, { ref: ref }));
        });
    };
}
/**
 * @function connect
 * @param store
 * @param connectToProp
 */
export function connect(store, connectToProp) {
    if (connectToProp === void 0) { connectToProp = 'store'; }
    return function (Component) {
        var StoreConsumer = /** @class */ (function (_super) {
            tslib_1.__extends(StoreConsumer, _super);
            function StoreConsumer() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            StoreConsumer.prototype.renderComponent = function (state) {
                var _a;
                var props = tslib_1.__assign({}, this.props, (_a = {}, _a[connectToProp] = state, _a));
                return React.createElement(Component, tslib_1.__assign({}, props));
            };
            StoreConsumer.prototype.render = function () {
                var Consumer = store.context.Consumer;
                return React.createElement(Consumer, null, this.renderComponent);
            };
            return StoreConsumer;
        }(React.Component));
        return React.forwardRef(function (props, ref) {
            return React.createElement(StoreConsumer, tslib_1.__assign({}, props, { ref: ref }));
        });
    };
}
