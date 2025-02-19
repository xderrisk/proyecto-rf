const { app } = require('electron');
const { createWindow } = require('./windowManager');
const { createMenu } = require('./menu');
require('./ipcHandlers');

app.commandLine.appendSwitch('enable-speech-dispatcher');

app.whenReady().then(async () => {
  const win = await createWindow(); // 👈 Agregar `await`
  createMenu(win);

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = await createWindow(); // 👈 Agregar `await`
      createMenu(newWin);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
