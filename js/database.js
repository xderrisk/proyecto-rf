const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

module.exports = db;
