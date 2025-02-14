const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    rutaModelos: () => ipcRenderer.invoke('ruta-modelos'),
    rutaImagenes: () => ipcRenderer.invoke('ruta-imagenes'),
    leerConfig: () => ipcRenderer.invoke('leer-config'),
    pantallaCompleta: () => ipcRenderer.invoke('pantalla-completa'),
    adminew: (username, password) => ipcRenderer.invoke('adminew', { username, password }),
    login: (username, password) => ipcRenderer.invoke('login', { username, password }),
    add: (nombre, apellido, imagen) => ipcRenderer.invoke('add-user', { nombre, apellido, imagen }),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    obtenerUsuarios: () => ipcRenderer.invoke("obtenerUsuarios"),
    registrarReconocimiento: (nombre, foto, fecha_hora) => ipcRenderer.invoke("registrarReconocimiento", { nombre, foto, fecha_hora }),
    obtenerRegistros: () => ipcRenderer.invoke("obtenerRegistros"),
});
