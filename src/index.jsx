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

  const [items, setItems] = VDom.useState([
    { id: '1', value: 'List item 1' },
    { id: '2', value: 'List item 2' },
    { id: '3', value: 'List item 3' },
  ]);

  const flipIt = () => setItems(prev => prev.reverse());

  return (
    <div style="font-family: sans-serif;">
      <h1 cool-attrib={state % 2 === 0 ? 'hey' : ''}>
        {inputState}, the counter is {state}
      </h1>
      <p>
        <button
          style="border-radius: 4px; border: none; padding: 1em;"
          onClick={() => setState(p => p + 1)}
        >
          Click me
        </button>
        <button
          style="border-radius: 4px; border: none; padding: 1em;"
          onClick={flipIt}
        >
          Flip array
        </button>
      </p>
      <input
        style="border-radius: 4px; border: none; padding: 0.5em; margin: 1em;"
        value={inputState}
        onInput={e => setInput(e.target.value)}
      />
      <div id="children">{props.children}</div>
      <ul>
        {items.map(item => {
          console.log('Rendering:', item);
          return <li key={item.id}>{item.value}</li>;
        })}
        <li>Hmm...</li>
        {items.map(item => (
          <li key={`${item.id}-again`}>{item.value} again</li>
        ))}
      </ul>
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

  container
);
