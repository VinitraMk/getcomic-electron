import React from 'react';
import Home from "./modules/home/Home";

export class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="gc-root">
        <Home/>
      </div>
    );
  }
}

export default App;
