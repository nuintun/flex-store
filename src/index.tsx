/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */

import * as React from 'react';
import { Callback, isFunction, generateStoreName } from './utils';
import Repository, { StoreState, StoreUpdater, StoreWatcher, StoreSubscriber } from './store';

export type UserStore = {
  [key: string]: any;
  readonly state: StoreState;
  subscribe(fn: StoreSubscriber): void;
  unsubscribe(fn: StoreSubscriber): void;
  setState(updater: StoreUpdater, callback?: Callback): void;
};
export interface ContextState {
  version: number;
  store: UserStore;
  mounted: boolean;
}
export interface Store {
  readonly name: string;
  readonly state: ContextState;
  watch(fn: StoreWatcher): void;
  unwatch(fn: StoreWatcher): void;
  readonly context: React.Context<StoreState>;
}
export interface Props extends React.ClassAttributes<Object> {
  [prop: string]: any;
  ref?: React.Ref<any>;
  forwardRef?: React.Ref<any>;
}
export interface ProviderDecorator {
  (Component: React.ComponentType<Props>): any;
}
export interface ConsumerDecorator {
  (Component: React.ComponentType<Props>): any;
}
export type Updaters = { [updater: string]: any };
export type MapStoreToProps = (store: UserStore, state: StoreState, props: Props) => Props;

// Variable definition
const { hasOwnProperty } = Object.prototype;
const defaultMapStoreToProps: MapStoreToProps = (store: UserStore) => ({ store });

/**
 * @function create
 * @param initialState
 * @param updater
 */
export function create(initialState: StoreState, updaters?: Updaters, name?: string): Store {
  // Create store
  const repository = new Repository(initialState);
  const store: UserStore = Object.defineProperties(Object.create(null), {
    state: { get: () => repository.state, enumerable: true },
    setState: { value: repository.setState.bind(repository), enumerable: true },
    subscribe: { value: repository.subscribe.bind(repository), enumerable: true },
    unsubscribe: { value: repository.unsubscribe.bind(repository), enumerable: true }
  });

  // Mixin updaters
  if (updaters) {
    for (const method in updaters) {
      // Use Object.prototype.hasOwnProperty fallback with Object create by Object.create(null)
      if (hasOwnProperty.call(updaters, method)) {
        const updater = updaters[method];

        // If is function binding context with store
        store[method] = isFunction(updater) ? updater.bind(store) : updater;
      }
    }
  }

  // Watcher
  const watch = repository.watch.bind(repository);
  const unwatch = repository.unwatch.bind(repository);
  const state: ContextState = { version: Date.now(), store, mounted: false };

  // Store
  return Object.defineProperties(Object.create(null), {
    state: { value: state },
    watch: { value: watch },
    unwatch: { value: unwatch },
    name: { value: name || generateStoreName() },
    context: { value: React.createContext(state), enumerable: true }
  });
}

/**
 * @function mount
 * @param store
 * @param storeProp
 */
export function mount(
  store: Store,
  mapStoreToProps: MapStoreToProps = defaultMapStoreToProps,
  forwardRef: boolean = false
): ProviderDecorator {
  const { watch, unwatch, context, state } = store;

  /**
   * @function mount
   * @param Component
   */
  return function(Component: React.ComponentType<Props>) {
    /**
     * @class StoreProvider
     */
    class StoreProvider extends React.Component<Props> {
      /**
       * @property state
       */
      public readonly state: ContextState;

      /**
       * @constructor
       * @param props
       * @param context
       */
      constructor(props: Props, context: React.Context<Object>) {
        super(props, context);

        // Initialization state
        this.state = {
          mounted: true,
          store: state.store,
          version: state.version
        };

        // Subscribe store change
        watch(this.storeUpdater);
      }

      /**
       * @method storeUpdater
       */
      private storeUpdater: StoreWatcher = (updater: () => StoreState, callback: Callback) => {
        this.setState(() => {
          // If null return null
          if (updater() === null) {
            return null;
          }

          // Change timestamp trigger provider update
          return { version: Date.now() };
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
      public render() {
        const state = this.state;
        const { Provider } = context;
        const { store: repository } = state;
        const { forwardRef, ...rest } = this.props;
        const props = { ...rest, ...mapStoreToProps(repository, repository.state, this.props) };

        return (
          <Provider value={state}>
            <Component {...props} ref={forwardRef} />
          </Provider>
        );
      }
    }

    // Fallback forwardRef
    if (forwardRef) {
      return React.forwardRef((props: Props, ref: React.Ref<any>) => <StoreProvider {...props} forwardRef={ref} />);
    }

    // Return StoreProvider
    return StoreProvider;
  };
}

/**
 * @function connect
 * @param store
 * @param storeProp
 */
export function connect(
  store: Store,
  mapStoreToProps: MapStoreToProps = defaultMapStoreToProps,
  forwardRef: boolean = false
): ConsumerDecorator {
  const { name, context } = store;

  /**
   * @function connect
   * @param Component
   */
  return function(Component: React.ComponentType<Props>) {
    /**
     * @class StoreConsumer
     */
    class StoreConsumer extends React.Component<Props> {
      /**
       * @method componentRender
       * @param state
       */
      private componentRender = (state: ContextState) => {
        if (!state.mounted) {
          throw new ReferenceError(`Store <${name}> provider not yet mounted on the parent or current component`);
        }

        const { store: repository } = state;
        const { forwardRef, ...rest } = this.props;
        const props = { ...rest, ...mapStoreToProps(repository, repository.state, this.props) };

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
      return React.forwardRef((props: Props, ref: React.Ref<any>) => <StoreConsumer {...props} forwardRef={ref} />);
    }

    // Return StoreConsumer
    return StoreConsumer;
  };
}
