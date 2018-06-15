# rc-flex-store

> A flexible state store for React component.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { create, mount, connect } from 'rc-flex-store';

const store = create(
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

@connect(store, 'counter')
class CounterView extends React.Component {
  render() {
    const { counter } = this.props;

    return <span> {counter.state.count} </span>;
  }
}

@connect(store, 'counter')
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

@mount(store, 'counter')
class App extends React.Component {
  render() {
    return <Counter />;
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
```
