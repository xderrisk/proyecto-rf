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

  const db = require('./database');
  db.get('SELECT COUNT(*) AS count FROM admi', (err, row) => {
    let inicio = 'html/index.html';

    if (err) {
      console.error('Error verificando admins:', err);
    } else if (row.count === 0) {
      inicio = 'html/signin.html';
    }

    win.loadFile(inicio);
  });

  return win;
}

module.exports = { createWindow };
