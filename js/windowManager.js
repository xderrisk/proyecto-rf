const { BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    minWidth: 400,
    minHeight: 450,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('html/index.html');
  return win;
}

module.exports = { createWindow };
