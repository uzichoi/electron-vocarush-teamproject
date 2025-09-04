import { app, BrowserWindow } from "electron";
import createWindow from "./createWindows.js";

app.whenReady().then(() => {
  createWindow();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
