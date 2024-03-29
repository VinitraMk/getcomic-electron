const { app, BrowserWindow,ipcMain,remote, Menu,MenuItem } = require('electron');
const {channels} = require("../src/shared/constants");
const path = require('path');
const url = require('url');

let rightClckPos = null;
const menu = new Menu();
const menuItem = new MenuItem({
    label:'Inspect Element Ctrl+I',
    click:()=>{
      remote.getCurrentWebContents().inspectElement(rightClckPos.x,rightClckPos.y);
    }
});

menu.append(menuItem);

let mainWindow;
function createWindow () {
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  });
  mainWindow = new BrowserWindow({ width: 800, height: 600, webPreferences:{ preload: path.join(__dirname,'preload.js')}, icon: `${__dirname}/getcomic-logo.ico` });
  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  //mainWindow.setMinimizable(false);
  mainWindow.maximize();
}
app.on('ready', createWindow);
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on(channels.APP_INFO, (event) => {
  event.sender.send(channels.APP_INFO, {
    appName: app.getName(),
    appVersion: app.getVersion(),
  });
});

