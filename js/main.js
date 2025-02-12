const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
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

  verificarAdmin(win);
}

const db = new sqlite3.Database(path.join(__dirname, '../config/database.db'));
const sqlSchema = `
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    imagen BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS admi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
`;

db.exec(sqlSchema, (err) => {
  if (err) {
      console.error('Error ejecutando SQL:', err);
  } else {
      console.log('Tablas verificadas correctamente.');
  }
});

function verificarAdmin(win) {
  db.get('SELECT COUNT(*) AS count FROM admi', (err, row) => {
      if (err) {
          console.error('Error verificando admins:', err);
          return;
      }
      if (row.count === 0) {
        win.loadFile('html/adminew.html');
      }
  });
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

ipcMain.handle('open-file-dialog', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png'] }],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('adminew', async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
      const query = `INSERT INTO admi (username, password) VALUES (?, ?)`;
      db.run(query, [username, password], function(err) {
          if (err) {
              reject({ success: false, error: err.message });
          } else {
              resolve({ success: true });
          }
      });
  });
});

ipcMain.handle('login', async (event, { username, password }) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM admi WHERE username = ? AND password = ?`;
        db.get(query, [username, password], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? true : false);
            }
        });
    });
});

ipcMain.handle('add-user', async (event, { nombre, apellido, imagen }) => {
  return new Promise((resolve, reject) => {
    fs.readFile(imagen, (err, imageBuffer) => {
      if (err) {
        reject(new Error(`Error reading image file: ${err.message}`));
        return;
      }
      const query = `INSERT INTO user (nombre, apellido, imagen) VALUES (?, ?, ?)`;
      db.run(query, [nombre, apellido, imageBuffer], function(err) {
        if (err) {
          reject({ success: false, error: err.message });
          } else {
            resolve({ success: true });
          }
        }
      );
    });
  });
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