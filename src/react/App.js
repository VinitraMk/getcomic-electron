import React from 'react';
import {channels} from "../shared/constants";
const {ipcRenderer} = window;

export class App extends React.Component {

  constructor(props) {
    super(props);

    ipcRenderer.send(channels.APP_INFO);
    ipcRenderer.on(channels.APP_INFO, (event, arg) => {
      ipcRenderer.removeAllListeners(channels.APP_INFO);
      const { appName, appVersion } = arg;
      this.setState({ appName, appVersion });
    });
  }

  render() {
    return (
      <div className="gc-root">
        <p>Hello World</p>
      </div>
    );
  }
}

export default App;
