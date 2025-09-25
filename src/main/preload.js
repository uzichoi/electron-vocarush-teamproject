// main/preload.js

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  captureFace: async (name) => {
    const result = await ipcRenderer.invoke("face:capture", name);
    if (!result || !result.savePath) return result;

    // pathToFileURL 대신 직접 file:// URL 생성
    const normalizedPath = result.savePath.replace(/\\/g, "/");
    const fileUrl = `file:///${normalizedPath.replace(/^\/+/, "")}`;
    const busted = `${fileUrl}?t=${Date.now()}`;

    return { ...result, fileUrl: busted };
  },

  readWordList: (name) => ipcRenderer.invoke("words:read", name),
  readWordsFile: (fileName) => ipcRenderer.invoke("words:read", fileName),
  readRanking: () => ipcRenderer.invoke("ranking:read"),
});