const { app, BrowserWindow, Menu, ipcMain } = require('electron');
app.commandLine.appendSwitch('enable-speech-dispatcher');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    minWidth: 400,
    minHeight: 450,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
  });

  win.loadFile('html/index.html');

  const template = [
    {
      label: '<',
      click: () => {
        if (win.webContents.navigationHistory.canGoBack()) {
          win.webContents.navigationHistory.goBack()
        }
      },
    },
    {
      label: 'Opciones',
      submenu: [
        { label: 'Configuración',
          click() {
            win.loadFile('html/config.html')
          }
        },
        { label: 'Salir', role: 'quit' },
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        { label: 'Herramientas de desarrollo',
          click() {
            win.webContents.toggleDevTools()
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

ipcMain.handle('leer-config', async () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../config/config.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo JSON:', error);
    return null;
  }
})

ipcMain.handle('ruta-modelos', async () => {
  const rutaDeterminada = path.join(__dirname, '../models');
  return rutaDeterminada;
});

ipcMain.handle('ruta-imagenes', async () => {
  const rutaDeterminada = path.join(__dirname, '../labels');
  return rutaDeterminada;
});

ipcMain.handle('pantalla-completa', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.setFullScreen(!win.isFullScreen());
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});