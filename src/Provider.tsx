/**
 * @module Provider
 * @license MIT
 */

import { storeShape } from './PropTypes';
import { Component, Children } from 'react';

export interface ProviderProps {
  store: Object;
}

export default class Provider extends Component<ProviderProps> {
  static propTypes = {
    store: storeShape.isRequired
  };

  static childContextTypes = {
    flexStore: storeShape.isRequired
  };

  getChildContext() {
    return {
      flexStore: this.props.store
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}
