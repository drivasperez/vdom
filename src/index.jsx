/** @jsx VDom.createElement */

import VDom from './vdom';
const container = document.getElementById('root');

function App(props) {
  return <h1>Hello {props.name}</h1>;
}

const element = <App name="foo" />;
VDom.render(element, container);
