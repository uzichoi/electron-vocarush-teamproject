const { ipcMain, app } = require("electron");
const path = require("path");
const fs = require("fs/promises");

ipcMain.handle("words:read", async (_evt, fileName) => {   // 메인 IPC(Inter-Process Communication) 핸들러
  try {
    // 개발/배포 경로 분기
    const baseDir = app.isPackaged ? path.join(process.resourcesPath, "renderer", "assets", "wordLists") : path.join(__dirname, "..", "..", "renderer", "assets", "wordLists");
    const filePath = path.join(baseDir, fileName);
    const raw = await fs.readFile(filePath, "utf-8");

    return raw
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
  } catch (e) {
    console.error("words:read 실패:", e);
    return [];
  }
});
