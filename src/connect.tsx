/**
 * @module connect
 * @license MIT
 */

import shallowEqual from 'shallowequal';
import { storeShape } from './PropTypes';
import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';

function getDisplayName(WrappedComponent: React.ComponentClass): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function isStateless(Component: React.ComponentClass) {
  return !Component.prototype.render;
}

const defaultMapStateToProps = () => ({});

export interface ConnectProps {}

export interface ConnectContext {
  flexStore: Object;
}

export default function connect(mapStateToProps?: Function) {
  const shouldSubscribe = !!mapStateToProps;
  const finnalMapStateToProps = mapStateToProps || defaultMapStateToProps;

  return function wrapWithConnect(WrappedComponent: React.ComponentClass) {
    class Connect extends Component<ConnectProps> {
      store: any;
      nextState: any;
      unsubscribe: Function;
      wrappedInstance: any;

      static displayName = `Connect(${getDisplayName(WrappedComponent)})`;

      static contextTypes = {
        flexStore: storeShape.isRequired
      };

      constructor(props: ConnectProps, context: ConnectContext) {
        super(props, context);

        this.store = context.flexStore;
        this.state = { subscribed: finnalMapStateToProps(this.store.state, props) };
      }

      componentDidMount() {
        this.trySubscribe();
      }

      componentWillUnmount() {
        this.tryUnsubscribe();
      }

      handleChange = (state: Object, callback?: () => void): void => {
        if (!this.unsubscribe) return;

        const nextState = finnalMapStateToProps(state, this.props);

        if (!shallowEqual(this.nextState, nextState)) {
          this.nextState = nextState;
          this.setState({ subscribed: nextState }, callback);
        }
      };

      trySubscribe() {
        if (shouldSubscribe) {
          this.unsubscribe = this.store.subscribe(this.handleChange);
          this.handleChange(this.store.getState());
        }
      }

      tryUnsubscribe() {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
      }

      getWrappedInstance() {
        return this.wrappedInstance;
      }

      render() {
        let props = {
          ...this.props,
          ...this.state.subscribed,
          store: this.store
        };

        if (!isStateless(WrappedComponent)) {
          props = {
            ...props,
            ref: (ref: any) => (this.wrappedInstance = ref)
          };
        }

        return <WrappedComponent {...props} />;
      }
    }

    return hoistStatics(Connect, WrappedComponent);
  };
}
