/** @jsx VDom.createElement */

import VDom from './vdom';
const container = document.getElementById('root');

function Counter() {
  const [state, setState] = VDom.useState(1);
  return (
    <div>
      <h1>Hello world, the counter is {state}</h1>
      <button onClick={() => setState(state + 1)}>Click me</button>
    </div>
  );
}

VDom.render(<Counter />, container);
