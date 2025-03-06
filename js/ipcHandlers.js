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
  try {
    await db.query(`INSERT INTO admi (username, password) VALUES ($1, $2)`, [username, password]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('login', async (event, { username, password }) => {
  try {
    const res = await db.query(`SELECT * FROM admi WHERE username = $1 AND password = $2`, [username, password]);
    return res.rows.length > 0;
  } catch (err) {
    return false;
  }
});

ipcMain.handle('add-user', async (event, { nombre, apellido, imagen }) => {
  try {
    let imageBuffer;

    // Verifica si la imagen es base64
    if (imagen.startsWith('data:image/')) {
      // Extrae los datos binarios de la cadena base64
      const base64Data = imagen.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Si no es base64, entonces debería ser una ruta de archivo
      imageBuffer = fs.readFileSync(imagen);
    }
    await db.query(`INSERT INTO "user" (nombre, apellido, imagen) VALUES ($1, $2, $3)`, [nombre, apellido, imageBuffer]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('obtenerUsuarios', async () => {
  try {
    const res = await db.query(`SELECT nombre, apellido, imagen FROM "user"`);
    return res.rows;
  } catch (err) {
    return [];
  }
});

ipcMain.handle('registrarReconocimiento', async (event, { nombre, foto, fecha_hora }) => {
  try {
    const imageBuffer = Buffer.from(foto, 'base64');
    await db.query(`INSERT INTO registro (nombre, foto, fecha_hora) VALUES ($1, $2, $3)`, [nombre, imageBuffer, fecha_hora]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('obtenerRegistros', async () => {
  try {
    const res = await db.query(`SELECT id, nombre, foto, fecha_hora FROM registro ORDER BY fecha_hora DESC`);
    return res.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      foto: row.foto.toString("base64"),
      fecha_hora: row.fecha_hora
    }));
  } catch (err) {
    return [];
  }
});
