const { Menu } = require('electron');

function createMenu(win) {
  const template = [
    {
      label: '<',
      click: () => {
        if (win.webContents.canGoBack()) {
          win.webContents.goBack();
        }
      },
    },
    {
      label: 'Opciones',
      submenu: [
        { label: 'Configuración', click: () => win.loadFile('html/config.html') },
        { label: 'Salir', role: 'quit' },
      ],
    },
    {
      label: 'Ayuda',
      submenu: [
        { label: 'Herramientas de desarrollo', click: () => win.webContents.toggleDevTools() },
      ],
    },
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu };
