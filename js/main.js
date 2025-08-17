const { app } = require('electron');
const { createWindow } = require('./windowManager');
const { createMenu } = require('./menu');
require('./ipcHandlers');

// Servidor
const express = require('express');
const { Pool } = require('pg');
const http = require('http');
const socketIo = require('socket.io');

// --- Servidor Express y Socket.IO ---
const serverApp = express();
const server = http.createServer(serverApp);
const io = socketIo(server);

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '1314',
    port: 5432,
});

serverApp.use(express.static('./server'));

async function getRecords() {
    const res = await pool.query("SELECT nombre, fecha_hora, foto FROM registro ORDER BY fecha_hora DESC");
    return res.rows.map(record => ({
        nombre: record.nombre,
        fecha_hora: record.fecha_hora,
        foto: record.foto ? `data:image/jpeg;base64,${Buffer.from(record.foto).toString("base64")}` : null,
    }));
}

io.on('connection', async (socket) => {
    console.log('Usuario conectado');
    socket.emit('update', await getRecords());
});

async function watchTable() {
    const client = await pool.connect();
    await client.query("LISTEN new_record");
    await client.query("LISTEN new_unknown");

    client.on("notification", async (msg) => {
        if (msg.channel === "new_unknown") {
            console.log("⚠️ Se detectó un nuevo desconocido!");
            io.emit("alerta_desconocido", "Se ha detectado un desconocido nuevo.");
        }
        io.emit("update", await getRecords());
    });
}

watchTable();

server.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});
// --- Fin del servidor Express y Socket.IO ---

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
