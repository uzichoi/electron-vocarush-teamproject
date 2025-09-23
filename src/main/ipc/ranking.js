// main/ipc/ranking.js
const { ipcMain, app } = require("electron");
const fs = require("fs/promises");
const path = require("path");

function getRankingFilePath() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), "renderer", "assets", "ranking", "ranking.json");
  } else {
    return path.join(__dirname, "..", "..", "renderer", "assets", "ranking", "ranking.json");
  }
}

ipcMain.handle("ranking:read", async () => {
  const filePath = getRankingFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(raw);
    return { ok: true, rankings: json, path: filePath };
  } catch (err) {
    return {
      ok: false,
      error: { message: err.message, code: err.code, pathTried: filePath },
    };
  }
});
