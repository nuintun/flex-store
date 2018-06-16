/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */

import * as React from 'react';
import { isFunction } from './utils';
import Repository, { StateUpdater } from './store';

declare type UserStore = {
  [key: string]: any;
  subscribe(fn: () => void): void;
  unsubscribe(fn: () => void): void;
  readonly state: React.ComponentState;
  setState(updater: StateUpdater, callback?: () => void): Promise<void>;
};
declare type State = { store: UserStore; mounted: boolean };
declare type Store = { store: UserStore; context: React.Context<React.ComponentState> };
declare type MountedComponent = (Component: React.ComponentType<any>) => React.ClassType<any, any, any>;
declare type ConnectedComponent = (Component: React.ComponentType<any>) => React.ClassType<any, any, any>;

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @function create
 * @param defaultState
 * @param updater
 */
export function create(defaultState: React.ComponentState, updater?: { [key: string]: any }): Store {
  // Create store
  const repository = new Repository(defaultState);
  const store: UserStore = Object.defineProperties(Object.create(null), {
    state: { get: () => repository.state, enumerable: true },
    setState: { value: repository.setState.bind(repository), enumerable: true },
    subscribe: { value: repository.subscribe.bind(repository), enumerable: true },
    unsubscribe: { value: repository.unsubscribe.bind(repository), enumerable: true }
  });

  // Mixin updater
  if (updater) {
    for (const prop in updater) {
      // Use Object.prototype.hasOwnProperty fallback with Object create by Object.create(null)
      if (hasOwnProperty.call(updater, prop)) {
        const method = updater[prop];

        // If is function binding context with store
        store[prop] = isFunction(method) ? method.bind(store) : method;
      }
    }
  }

  // Store
  return { store, context: React.createContext({ store, mounted: false }) };
}

/**
 * @function mount
 * @param store
 * @param mapToProp
 */
export function mount(store: Store, mapToProp: string = 'store', forwardRef: boolean = false): MountedComponent {
  const { store: repository, context } = store;

  /**
   * @function mount
   * @param Component
   */
  return function(Component: React.ComponentType<any>) {
    /**
     * @class StoreProvider
     */
    class StoreProvider extends React.Component<any> {
      /**
       * @property state
       */
      public state: State;

      /**
       * @constructor
       * @param props
       * @param context
       */
      constructor(props: React.Props<any>, context: React.Context<any>) {
        super(props, context);

        // Initialization state
        this.state = {
          mounted: true,
          store: repository
        };

        // Subscribe store change
        repository.subscribe(this.storeUpdater);
      }

      /**
       * @method storeUpdater
       */
      private storeUpdater = () => {
        this.setState({ store: repository });
      };

      /**
       * @method componentWillUnmount
       */
      public componentWillUnmount() {
        // Unsubscribe store change
        repository.unsubscribe(this.storeUpdater);
      }

      /**
       * @method render
       */
      public render(): React.ReactNode {
        const state = this.state;
        const { Provider } = context;
        const { forwardRef, ...rest } = this.props;
        const props = { ...rest, [mapToProp]: state.store };

        return (
          <Provider value={state}>
            <Component {...props} ref={forwardRef} />
          </Provider>
        );
      }
    }

    // Fallback forwardRef
    if (forwardRef) {
      return React.forwardRef((props: React.Props<any>, ref: React.Ref<any>) => {
        return <StoreProvider {...props} forwardRef={ref} />;
      });
    }

    // Return StoreProvider
    return StoreProvider;
  };
}

/**
 * @function connect
 * @param store
 * @param mapToProp
 */
export function connect(store: Store, mapToProp: string = 'store', forwardRef: boolean = false): ConnectedComponent {
  /**
   * @function connect
   * @param Component
   */
  return function(Component: React.ComponentType<any>) {
    /**
     * @class StoreConsumer
     */
    class StoreConsumer extends React.Component<any> {
      /**
       * @method componentRender
       * @param state
       */
      private componentRender = (state: State) => {
        if (!state.mounted) {
          throw new ReferenceError(`Store <${mapToProp}> provider not yet mounted on the parent or current component`);
        }

        const { forwardRef, ...rest } = this.props;
        const props = { ...rest, [mapToProp]: state.store };

        return <Component {...props} ref={forwardRef} />;
      };

      /**
       * @method render
       */
      public render() {
        const { Consumer } = store.context;

        return <Consumer>{this.componentRender}</Consumer>;
      }
    }

    // Fallback forwardRef
    if (forwardRef) {
      return React.forwardRef((props: React.Props<any>, ref: React.Ref<any>) => (
        <StoreConsumer {...props} forwardRef={ref} />
      ));
    }

    // Return StoreConsumer
    return StoreConsumer;
  };
}
