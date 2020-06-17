/** @jsx VDom.createElement */

import VDom from './vdom';
const container = document.getElementById('root');

function Counter() {
  const [state, setState] = VDom.useState(1);
  const [inputState, setInput] = VDom.useState('world');

  VDom.useEffect(() => {
    document.title = state + inputState;
    console.log('Effect ran with', state, inputState);
    return () => console.log('Cleanup ran with', state, inputState);
  }, [inputState, state]);

  return (
    <div>
      <h1>
        Hello {inputState}, the counter is {state}
      </h1>
      <button onClick={() => setState((p) => p + 2)}>Click me</button>
      <input value={inputState} onInput={(e) => setInput(e.target.value)} />
    </div>
  );
}

VDom.render(<Counter />, container);
