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
    <div style="font-family: sans-serif;">
      <h1>
        {inputState}, the counter is {state}
      </h1>
      <p>
        <button
          style="border-radius: 4px; border: none; padding: 1em;"
          onClick={() => setState((p) => p + 2)}
        >
          Click me
        </button>
      </p>
      <input
        style="border-radius: 4px; border: none; padding: 0.5em; margin: 1em;"
        value={inputState}
        onInput={(e) => setInput(e.target.value)}
      />
      <div id="children">{props.children}</div>
    </div>
  );
}

VDom.render(
  <App>
    <Counter>
      <div>Hi</div>
      <p>These children are in an array and that's ok</p>
    </Counter>
    <h4>Yo</h4>
  </App>,

  container,
);
