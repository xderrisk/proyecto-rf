const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    rutaModelos: () => ipcRenderer.invoke('ruta-modelos'),
    rutaImagenes: () => ipcRenderer.invoke('ruta-imagenes'),
    leerConfig: () => ipcRenderer.invoke('leer-config'),
    pantallaCompleta: () => ipcRenderer.invoke('pantalla-completa')
});
