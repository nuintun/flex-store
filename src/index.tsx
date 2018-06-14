/**
 * @module index
 * @license MIT
 * @see https://reactjs.org/docs/context.html
 */

import React from 'react';
import Store from './Store';

type StoreContext = { store: Store; context: React.Context<React.ComponentState> };

/**
 * @function create
 * @param defaultState
 * @param updater
 */
export function create(defaultState?: React.ComponentState, updater?: { [key: string]: () => void }): StoreContext {
  const store = new Store(defaultState);

  for (let method in updater) {
    if (updater.hasOwnProperty(method) && !Store.blacklist(method)) {
      store[method] = updater[method];
    }
  }

  return { store, context: React.createContext(defaultState) };
}

/**
 * @function mount
 * @param param0
 * @param mountToProp
 */
export function mount({ store, context }: StoreContext, mountToProp: string = 'store') {
  return function(Component: React.ComponentClass | React.StatelessComponent) {
    class StoreProvider extends React.Component {
      state = { store };

      updater = () => {
        this.setState({ store });
      };

      componentDidMount() {
        store.subscribe(this.updater);
      }

      componentWillUnmount() {
        store.unsubscribe(this.updater);
      }

      render() {
        const { Provider } = context;
        const { store: value } = this.state;
        const props = { ...this.props, [mountToProp]: value };

        return (
          <Provider value={value}>
            <Component {...props} />
          </Provider>
        );
      }
    }

    return React.forwardRef((props, ref: React.Ref<any>) => {
      return <StoreProvider {...props} ref={ref} />;
    });
  };
}

/**
 * @function connect
 * @param store
 * @param connectToProp
 */
export function connect(store: StoreContext, connectToProp: string = 'store') {
  return function(Component: React.ComponentClass | React.StatelessComponent) {
    class StoreConsumer extends React.Component {
      renderComponent(state: React.ComponentState) {
        const props = { ...this.props, [connectToProp]: state };

        return <Component {...props} />;
      }

      render() {
        const { Consumer } = store.context;

        return <Consumer>{this.renderComponent}</Consumer>;
      }
    }

    return React.forwardRef((props, ref: React.Ref<any>) => {
      return <StoreConsumer {...props} ref={ref} />;
    });
  };
}
