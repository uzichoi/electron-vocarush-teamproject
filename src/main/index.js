
// import { app, BrowserWindow } from "electron";
// import createWindow from "./createWindows.js";


// main/index.js
const { app, BrowserWindow } = require("electron");
const createWindow = require("./createWindows");
app.disableHardwareAcceleration();

// IPC 핸들러 등록
require("./ipc/face");
require("./ipc/ranking");
require("./ipc/words");

app.whenReady().then(() => {
  createWindow();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
