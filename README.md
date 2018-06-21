# rc-flex-store

> A flexible state store for React component.
>
> [![NPM Version][npm-image]][npm-url] > [![Dependencies][david-image]][david-url] > [![DevDependencies][dev-david-image]][dev-david-url]

### API

> create(initialState: React.ComponentState, updaters?: { [updater: string]: any }, name?: string): Store;
>
> - Create a store.
>
> mount(store: Store, mapStoreToProps?: (store: UserStore, state: StoreState, props: Props) => Props, forwardRef?: boolean): React.Component
>
> - Mount a store provider to react component.
>
> connect(store: Store, mapStoreToProps?: (store: UserStore, state: StoreState, props: Props) => Props;, forwardRef?: boolean): React.Component
>
> - Connect react component to a store consumer.

### Usage

```jsx
import ReactDOM from 'react-dom';
import React, { Fragment } from 'react';
import { create, mount, connect } from 'rc-flex-store';

const counter = create(
  {
    count: 0
  },
  {
    increment() {
      this.setState({ count: this.state.count + 1 });
    },
    decrement() {
      this.setState({ count: this.state.count - 1 });
    }
  }
);

@connect(counter, (store, { count }) => ({ count }))
class CounterView extends React.PureComponent {
  render() {
    const { count } = this.props;

    return <div> {count} </div>;
  }
}

@connect(counter, ({ decrement, increment }) => ({ decrement, increment }))
class CounterAction extends React.PureComponent {
  render() {
    const { decrement, increment } = this.props;

    return (
      <div>
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    );
  }
}

@mount(counter)
class Counter extends React.Component {
  render() {
    return (
      <Fragment>
        <CounterView />
        <CounterAction />
      </Fragment>
    );
  }
}

ReactDOM.render(<Counter />, document.getElementById('app'));
```

### Example

> [Online Demo](https://codesandbox.io/s/p3jrym1opx)

### Support

> Support `React >= 16.3.0`, if use `React < 16.3.0` please add `React.createContext` polyfill. See [create-react-context](https://github.com/jamiebuilds/create-react-context).

[npm-image]: https://img.shields.io/npm/v/rc-flex-store.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/rc-flex-store
[david-image]: http://img.shields.io/david/nuintun/rc-flex-store.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/rc-flex-store
[dev-david-image]: http://img.shields.io/david/dev/nuintun/rc-flex-store.svg?style=flat-square
[dev-david-url]: https://david-dm.org/nuintun/rc-flex-store?type=dev
