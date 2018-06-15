/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */

import * as React from 'react';
import { isFunction } from './utils';
import Repository, { StateUpdater } from './store';

const hasOwnProperty = Object.prototype.hasOwnProperty;

declare type UserStore = {
  [key: string]: any;
  state: React.ComponentState;
  subscribe(fn: () => void): void;
  unsubscribe(fn: () => void): void;
  setState(updater: StateUpdater, callback?: () => void): Promise<void>;
};

declare type State = {
  store: UserStore;
  mounted: boolean;
};

declare type Store = {
  store: UserStore;
  context: React.Context<React.ComponentState>;
};

declare type MountedComponent = (
  Component: React.ComponentClass<any> | React.StatelessComponent<any>
) => React.ComponentType<any>;

declare type ConnectedComponent = (
  Component: React.ComponentClass<any> | React.StatelessComponent<any>
) => React.ComponentType<any>;

/**
 * @function create
 * @param defaultState
 * @param updater
 */
export function create(defaultState: React.ComponentState, updater?: { [key: string]: any }): Store {
  const repository = new Repository(defaultState);
  const store: UserStore = Object.defineProperties(Object.create(null), {
    state: { get: () => repository.state },
    setState: { value: repository.setState.bind(repository) },
    subscribe: { value: repository.subscribe.bind(repository) },
    unsubscribe: { value: repository.unsubscribe.bind(repository) }
  });

  // Mixin updater
  if (updater) {
    for (const prop in updater) {
      // Use Object.prototype.hasOwnProperty fallback with Object create by Object.create(null)
      if (hasOwnProperty.call(updater, prop) && !Repository.blacklist(prop)) {
        const method = updater[prop];

        // If is function binding context with store
        store[prop] = isFunction(method) ? method.bind(store) : method;
      }
    }
  }

  return { store, context: React.createContext({ store, mounted: false }) };
}

/**
 * @function mount
 * @param store
 * @param mapToProp
 */
export function mount(store: Store, mapToProp: string = 'store'): MountedComponent {
  const { store: repository, context } = store;

  return function(Component: React.ComponentClass<any> | React.StatelessComponent<any>) {
    /**
     * @class StoreProvider
     */
    class StoreProvider extends React.Component<any> {
      public state: State = {
        mounted: true,
        store: repository
      };

      private storeUpdater = () => {
        this.setState({ store: repository });
      };

      public componentDidMount() {
        repository.subscribe(this.storeUpdater);
      }

      public componentWillUnmount() {
        repository.unsubscribe(this.storeUpdater);
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
export function connect(store: Store, mapToProp: string = 'store'): ConnectedComponent {
  return function(Component: React.ComponentClass<any> | React.StatelessComponent<any>) {
    /**
     * @class StoreConsumer
     */
    class StoreConsumer extends React.Component<any> {
      private componentRender = (state: State) => {
        if (!state.mounted) {
          throw new ReferenceError(`Store <${mapToProp}> provider not yet mounted on the parent or current component`);
        }

        const { forwardRef, ...rest } = this.props;
        const props = { ...rest, [mapToProp]: state.store };

        return <Component {...props} ref={forwardRef} />;
      };

      public render() {
        const { Consumer } = store.context;

        return <Consumer>{this.componentRender}</Consumer>;
      }
    }

    return React.forwardRef((props: React.Props<any>, ref: React.Ref<any>) => {
      return <StoreConsumer {...props} forwardRef={ref} />;
    });
  };
}
