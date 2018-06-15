# rc-flex-store

> A flexible state store for React component.
>
> [![NPM Version][npm-image]][npm-url]
> ![Node Version][node-image]
> [![Dependencies][david-image]][david-url]

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
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

@connect(counter, 'counter')
class CounterView extends React.Component {
  render() {
    const { counter } = this.props;

    return <span> {counter.state.count} </span>;
  }
}

@connect(counter, 'counter')
class Counter extends React.Component {
  render() {
    const { counter } = this.props;

    return (
      <div>
        <button onClick={counter.decrement}>-</button>
        <CounterView />
        <button onClick={counter.increment}>+</button>
      </div>
    );
  }
}

@mount(counter, 'counter')
class App extends React.Component {
  render() {
    return <Counter />;
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
```

[npm-image]: https://img.shields.io/npm/v/rc-flex-store.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/rc-flex-store
[node-image]: https://img.shields.io/node/v/rc-flex-store.svg?style=flat-square
[david-image]: http://img.shields.io/david/dev/nuintun/rc-flex-store.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/rc-flex-store?type=dev
