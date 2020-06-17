/** @jsx VDom.createElement */

import VDom from './vdom';
import App from './App';
const container = document.getElementById('root');

function Counter(props) {
  const [state, setState] = VDom.useState(1);
  const [inputState, setInput] = VDom.useState('Hello World');

  VDom.useEffect(() => {
    document.title = inputState;
    console.log('Effect ran with', inputState);
    return () => console.log('Cleanup ran with', inputState);
  }, [inputState]);

  return (
    <div>
      <h1>
        {inputState}, the counter is {state}
      </h1>
      <button onClick={() => setState((p) => p + 2)}>Click me</button>
      <input value={inputState} onInput={(e) => setInput(e.target.value)} />
      <div id="children">{props.children}</div>
    </div>
  );
}

VDom.render(
  <App>
    <Counter>
      <div>Hi</div>
    </Counter>
  </App>,

  container,
);
