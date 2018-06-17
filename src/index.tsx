/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */

import * as React from 'react';
import { Callback, isFunction } from './utils';
import Repository, { StoreState, StoreUpdater, StoreWatcher, StoreSubscriber } from './store';

export type UserStore = {
  [key: string]: any;
  readonly state: StoreState;
  subscribe(fn: StoreSubscriber): void;
  unsubscribe(fn: StoreSubscriber): void;
  setState(updater: StoreUpdater, callback?: Callback): void;
};
export type State = Readonly<{
  mounted: boolean;
  store: UserStore;
  timestamp: number;
}>;
export type Store = Readonly<{
  readonly defaultState: State;
  watch(fn: StoreWatcher): void;
  unwatch(fn: StoreWatcher): void;
  readonly context: React.Context<StoreState>;
}>;
export type MountedComponent = (Component: React.ComponentType<any>) => React.ClassType<any, any, any>;
export type ConnectedComponent = (Component: React.ComponentType<any>) => React.ClassType<any, any, any>;

// Object hasOwnProperty
const { hasOwnProperty } = Object.prototype;

/**
 * @function create
 * @param defaultState
 * @param updater
 */
export function create(defaultState: StoreState, updater?: { [key: string]: any }): Store {
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

  // Watcher
  const watch = repository.watch.bind(repository);
  const unwatch = repository.unwatch.bind(repository);
  const state: State = { store, mounted: false, timestamp: Date.now() };

  // Store
  return { watch, unwatch, defaultState: state, context: React.createContext(state) };
}

/**
 * @function mount
 * @param store
 * @param mapToProp
 */
export function mount(store: Store, mapToProp: string = 'store', forwardRef: boolean = false): MountedComponent {
  const { watch, unwatch, context, defaultState } = store;

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
      public readonly state: State;

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
          store: defaultState.store,
          timestamp: defaultState.timestamp
        };

        // Subscribe store change
        watch(this.storeUpdater);
      }

      /**
       * @method storeUpdater
       */
      private storeUpdater: StoreWatcher = (updater: () => StoreState, callback: Callback) => {
        this.setState(() => {
          // Run store updater
          const state = updater();

          // If null return null
          if (state === null) {
            return state;
          }

          // Change timestamp trigger provider update
          return { timestamp: Date.now() };
        }, callback);
      };

      /**
       * @method componentWillUnmount
       */
      public componentWillUnmount() {
        // Unsubscribe store change
        unwatch(this.storeUpdater);
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
  const { context } = store;

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
        const { Consumer } = context;

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
