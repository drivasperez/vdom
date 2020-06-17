/** @jsx VDom.createElement */

import VDom from './vdom';
const container = document.getElementById('root');

const updateValue = (e) => rerender(e.target.value);

const rerender = (value) => {
  const element = (
    <div>
      <input id="dan" onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  );
  VDom.render(element, container);
};

rerender('World');

