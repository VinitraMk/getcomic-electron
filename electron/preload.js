const { ipcRenderer,remote } = require('electron');

//webdriver = require("selenium-webdriver");
//driver = new webdriver.Builder()
//.usingServer("http://localhost:9515")
//.withCapabilities({
    //binary:"/dist/ElectronReactBoilerPlate Setup 0.1.0.exe"
//})
//.forBrowser("electron")
//.build();

//const scraper = remote.require("./scraper");
const mainProcess = remote.require("./main-process.js");
window.ipcRenderer = ipcRenderer;
window.mainProcess = mainProcess;