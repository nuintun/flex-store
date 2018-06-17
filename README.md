# rc-flex-store

> A flexible state store for React component.
>
> [![NPM Version][npm-image]][npm-url]
> [![Dependencies][david-image]][david-url]
> [![DevDependencies][dev-david-image]][dev-david-url]

### API

> create(initialState: React.ComponentState, updaters?: { [updater: string]: any }): Store;
>
> - Create a store.
>
> mount(store: Store, mapToProp: string = 'store', forwardRef: boolean = false): React.Component
>
> - Mount a store to react component.
>
> connect(store: Store, mapToProp: string = 'store', forwardRef: boolean = false): React.Component
>
> - Connect react component to a store.

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

const connectToCounter = connect(counter, 'counter');

@connectToCounter
class CounterView extends React.Component {
  render() {
    const { counter } = this.props;

    return <div> {counter.state.count} </div>;
  }
}

@connectToCounter
class CounterAction extends React.Component {
  render() {
    const { counter } = this.props;

    return (
      <div>
        <button onClick={counter.decrement}>-</button>
        <button onClick={counter.increment}>+</button>
      </div>
    );
  }
}

@mount(counter, 'counter')
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
