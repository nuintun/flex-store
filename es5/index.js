"use strict";
/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = require("react");
var store_1 = require("./store");
var utils_1 = require("./utils");
/**
 * @function create
 * @param defaultState
 * @param updater
 */
function create(defaultState, updater) {
    var store = new store_1.default(defaultState);
    for (var prop in updater) {
        if (updater.hasOwnProperty(prop) && !store_1.default.blacklist(prop)) {
            var method = updater[prop];
            store[prop] = utils_1.isFunction(method) ? method.bind(store) : method;
        }
    }
    return { store: store, context: react_1.default.createContext({ store: store, mounted: false }) };
}
exports.create = create;
/**
 * @function mount
 * @param store
 * @param mapToProp
 */
function mount(_a, mapToProp) {
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
                return (react_1.default.createElement(Provider, { value: state },
                    react_1.default.createElement(Component, tslib_1.__assign({}, props, { ref: forwardRef }))));
            };
            return StoreProvider;
        }(react_1.default.Component));
        return react_1.default.forwardRef(function (props, ref) {
            return react_1.default.createElement(StoreProvider, tslib_1.__assign({}, props, { forwardRef: ref }));
        });
    };
}
exports.mount = mount;
/**
 * @function connect
 * @param store
 * @param mapToProp
 */
function connect(store, mapToProp) {
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
                    return react_1.default.createElement(Component, tslib_1.__assign({}, props, { ref: forwardRef }));
                };
                return _this;
            }
            StoreConsumer.prototype.render = function () {
                var Consumer = store.context.Consumer;
                return react_1.default.createElement(Consumer, null, this.renderComponent);
            };
            return StoreConsumer;
        }(react_1.default.Component));
        return react_1.default.forwardRef(function (props, ref) {
            return react_1.default.createElement(StoreConsumer, tslib_1.__assign({}, props, { forwardRef: ref }));
        });
    };
}
exports.connect = connect;
