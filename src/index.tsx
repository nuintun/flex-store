/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */

import React from 'react';
import Store from './store';
import { isFunction } from './utils';

declare type StoreState = { store: Store; mounted: boolean };
declare type StoreContext = { store: Store; context: React.Context<React.ComponentState> };

/**
 * @function create
 * @param defaultState
 * @param updater
 */
export function create(defaultState?: React.ComponentState, updater?: { [key: string]: () => void }): StoreContext {
  const store = new Store(defaultState);

  // Mixin updater
  for (const prop in updater) {
    if (updater.hasOwnProperty(prop) && !Store.blacklist(prop)) {
      const method = updater[prop];

      // If is function binding context with store
      store[prop] = isFunction(method) ? method.bind(store) : method;
    }
  }

  return { store, context: React.createContext({ store, mounted: false }) };
}

/**
 * @function mount
 * @param store
 * @param mapToProp
 */
export function mount({ store, context }: StoreContext, mapToProp: string = 'store') {
  return function(Component: React.ComponentClass<any> | React.StatelessComponent<any>) {
    /**
     * @class StoreProvider
     */
    class StoreProvider extends React.Component<any> {
      public state: StoreState = {
        store,
        mounted: true
      };

      private storeUpdater = () => {
        this.setState({ store });
      };

      public componentDidMount() {
        store.subscribe(this.storeUpdater);
      }

      public componentWillUnmount() {
        store.unsubscribe(this.storeUpdater);
      }

      public render() {
        const state = this.state;
        const { Provider } = context;
        const { forwardRef, ...rest } = this.props;
        const props = { ...rest, [mapToProp]: state };

        return (
          <Provider value={state}>
            <Component {...props} ref={forwardRef} />
          </Provider>
        );
      }
    }

    return React.forwardRef((props: React.Props<any>, ref: React.Ref<any>) => {
      return <StoreProvider {...props} forwardRef={ref} />;
    });
  };
}

/**
 * @function connect
 * @param store
 * @param mapToProp
 */
export function connect(store: StoreContext, mapToProp: string = 'store') {
  return function(Component: React.ComponentClass<any> | React.StatelessComponent<any>) {
    /**
     * @class StoreConsumer
     */
    class StoreConsumer extends React.Component<any> {
      private renderComponent = (state: StoreState) => {
        if (!state.mounted) {
          throw new ReferenceError(`Store <${mapToProp}> provider not yet mounted on the parent or current component`);
        }

        const { forwardRef, ...rest } = this.props;
        const props = { ...rest, [mapToProp]: state.store };

        return <Component {...props} ref={forwardRef} />;
      };

      public render() {
        const { Consumer } = store.context;

        return <Consumer>{this.renderComponent}</Consumer>;
      }
    }

    return React.forwardRef((props: React.Props<any>, ref: React.Ref<any>) => {
      return <StoreConsumer {...props} forwardRef={ref} />;
    });
  };
}
