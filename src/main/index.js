// main/index.js

import { app, BrowserWindow } from "electron";
import createWindow from "./createWindows.js";

// IPC 핸들러 등록
import "./ipc/face.js";
import "./ipc/ranking.js";
import "./ipc/words.js";

app.whenReady().then(() => {
  createWindow();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
