"use strict";
/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = require("react");
var Store_1 = require("./Store");
/**
 * @function create
 * @param defaultState
 * @param updater
 */
function create(defaultState, updater) {
    var store = new Store_1.default(defaultState);
    for (var method in updater) {
        if (updater.hasOwnProperty(method) && !Store_1.default.blacklist(method)) {
            store[method] = updater[method];
        }
    }
    return { store: store, context: react_1.default.createContext(defaultState) };
}
exports.create = create;
/**
 * @function mount
 * @param param0
 * @param mountToProp
 */
function mount(_a, mountToProp) {
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
                return (react_1.default.createElement(Provider, { value: value },
                    react_1.default.createElement(Component, tslib_1.__assign({}, props))));
            };
            return StoreProvider;
        }(react_1.default.Component));
        return react_1.default.forwardRef(function (props, ref) {
            return react_1.default.createElement(StoreProvider, tslib_1.__assign({}, props, { ref: ref }));
        });
    };
}
exports.mount = mount;
/**
 * @function connect
 * @param store
 * @param connectToProp
 */
function connect(store, connectToProp) {
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
                return react_1.default.createElement(Component, tslib_1.__assign({}, props));
            };
            StoreConsumer.prototype.render = function () {
                var Consumer = store.context.Consumer;
                return react_1.default.createElement(Consumer, null, this.renderComponent);
            };
            return StoreConsumer;
        }(react_1.default.Component));
        return react_1.default.forwardRef(function (props, ref) {
            return react_1.default.createElement(StoreConsumer, tslib_1.__assign({}, props, { ref: ref }));
        });
    };
}
exports.connect = connect;
