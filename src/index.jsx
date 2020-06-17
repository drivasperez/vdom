/** @jsx VDom.createElement */

import VDom from './vdom';

const element = (
  <div id="hi">
    <h1>Hello!</h1>
    <ul>
      <li>This is</li>
      <li>Pretty bloody</li>
      <li>Cool</li>
    </ul>
  </div>
);

const container = document.getElementById('root');
VDom.render(element, container);
