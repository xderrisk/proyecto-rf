const { ipcMain, dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const configDir = path.join(__dirname, '../config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
  console.log('Carpeta config creada');
}
const db = require('./database');

ipcMain.handle('leer-config', async () => {
  const configPath = path.join(__dirname, '../config/config.json');
  
  try {
    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        bienvenida: "Bienvenido",
      };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
      console.log('Config.json creado con valores predeterminados.');
    }
    
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo JSON:', error);
    return null;
  }
});

ipcMain.handle('ruta-modelos', () => path.join(__dirname, '../models'));

ipcMain.handle('pantalla-completa', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.setFullScreen(!win.isFullScreen());
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }],
  });

  return !result.canceled && result.filePaths.length > 0 ? result.filePaths[0] : null;
});

ipcMain.handle('adminew', async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO admi (username, password) VALUES (?, ?)`, [username, password], function (err) {
      err ? reject({ success: false, error: err.message }) : resolve({ success: true });
    });
  });
});

ipcMain.handle('login', async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM admi WHERE username = ? AND password = ?`, [username, password], (err, row) => {
      err ? reject(err) : resolve(Boolean(row));
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
      db.run(`INSERT INTO user (nombre, apellido, imagen) VALUES (?, ?, ?)`, [nombre, apellido, imageBuffer], function (err) {
        err ? reject({ success: false, error: err.message }) : resolve({ success: true });
      });
    });
  });
});

ipcMain.handle('obtenerUsuarios', async () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT nombre, apellido, imagen FROM user`, [], (err, rows) => {
      err ? reject(err) : resolve(rows);
    });
  });
});

ipcMain.handle('registrarReconocimiento', async (event, { nombre, foto, fecha_hora }) => {
  return new Promise((resolve, reject) => {
    const imageBuffer = Buffer.from(foto);
    
    if (imageBuffer.length === 0) {
      reject({ success: false, error: "Imagen vacía" });
      return;
    }

    db.run(
      `INSERT INTO registro (nombre, foto, fecha_hora) VALUES (?, ?, ?)`, 
      [nombre, imageBuffer, fecha_hora], 
      function (err) {
        err ? reject({ success: false, error: err.message }) : resolve({ success: true });
      }
    );
  });
});

ipcMain.handle('obtenerRegistros', async () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, nombre, foto, fecha_hora FROM registro ORDER BY fecha_hora DESC`, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(
          rows.map(row => ({
            id: row.id,
            nombre: row.nombre,
            foto: row.foto.toString("base64"),
            fecha_hora: row.fecha_hora
          }))
        );
      }
    });
  });
});
