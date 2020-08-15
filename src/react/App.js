import React from 'react';
import logo from './logo.svg';
import './App.css';
import {channels} from "../shared/constants";
const {ipcRenderer} = window;

export class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      appName:'',
      appVersion:''
    };

    ipcRenderer.send(channels.APP_INFO);
    ipcRenderer.on(channels.APP_INFO, (event, arg) => {
      ipcRenderer.removeAllListeners(channels.APP_INFO);
      const { appName, appVersion } = arg;
      this.setState({ appName, appVersion });
    });
  }

  render() {
    const {appName,appVersion} = this.state;
    return (
      <div className="gc-root">
      </div>
    );
  }
}

export default App;