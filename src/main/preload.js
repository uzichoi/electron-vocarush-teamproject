// main/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  captureFace: (name) => ipcRenderer.invoke('face:capture', name),
  readWordList: (fileName) => ipcRenderer.invoke("words:read", fileName)
});
