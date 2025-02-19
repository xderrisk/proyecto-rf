const { BrowserWindow } = require('electron');
const path = require('path');
const pool = require('./database'); // Asegúrate de importar la conexión a PostgreSQL

async function createWindow() {
  const win = new BrowserWindow({
    minWidth: 400,
    minHeight: 450,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  try {
    const res = await pool.query('SELECT COUNT(*) AS count FROM admi');
    let inicio = 'html/index.html';

    if (res.rows[0].count === "0") { // PostgreSQL devuelve el count como string
      inicio = 'html/signin.html';
    }

    win.loadFile(inicio);
  } catch (err) {
    console.error('Error verificando admins:', err);
    win.loadFile('html/index.html'); // Fallback en caso de error
  }

  return win;
}

module.exports = { createWindow };
