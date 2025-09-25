// main/ipc/words.js
const { ipcMain, app } = require("electron");
const fs = require("fs/promises");
const path = require("path");

// 개발/배포 구분해서 wordLists 디렉터리 결정
function getWordListsDir() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), "renderer", "assets", "wordLists");
  } else {
    // 개발 시: 현재 main/에서 한 디렉토리 올라가 renderer/로 접근
    return path.join(__dirname, "..", "..", "renderer", "assets", "wordLists");
  }
}

function getWordListPath(input) {
  const filename = input?.endsWith(".txt") ? input : `${input || "words"}.txt`;
  return path.join(getWordListsDir(), filename);
}

ipcMain.handle("words:read", async (_evt, difficultyOrFileName) => {
  const filePath = getWordListPath(difficultyOrFileName);
  console.log("[words:read]", difficultyOrFileName, "→", filePath);

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const words = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    return { ok: true, words: raw, path: filePath };
  } catch (err) {
    return { ok: false, error: { message: err.message, code: err.code, pathTried: filePath } };
  }
});
