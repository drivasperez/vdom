/** @jsx VDom.createElement */

import VDom from './vdom';
import logo from './logo.svg';
import './App.css';

function App(props) {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>This isn't using react!</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        ></a>

        {props.children}
      </header>
    </div>
  );
}

export default App;
