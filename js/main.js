const { app, BrowserWindow, Menu } = require('electron');

const template = [
  {
    label: 'Administrar',
    submenu: [
      { label: 'Apagar camaras',
        type: 'checkbox',
        checked: false,
        click(menuItem) {
          mainWindow.webContents.send('toggle-cameras', menuItem.checked);
        } },
      { type: 'separator' },
      { label: 'Salir', role: 'quit' }
    ]
  },
  {
    label: 'Ayuda',
    submenu: [
      { label: 'Herramientas de desarrollo',
        click() {
          mainWindow.webContents.toggleDevTools()
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('html/index.html');
});
