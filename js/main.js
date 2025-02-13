const { app } = require('electron');
const { createWindow } = require('./windowManager');
const { createMenu } = require('./menu');
require('./ipcHandlers');

app.commandLine.appendSwitch('enable-speech-dispatcher');

app.whenReady().then(() => {
  const win = createWindow();
  createMenu(win);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createWindow();
      createMenu(newWin);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
