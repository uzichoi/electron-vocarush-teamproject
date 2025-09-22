// main/createWindow.js

const { BrowserWindow } = require("electron");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    title: "VocaRush",
    resizable: false,     // 윈도우 크기 조절 비허용
    fullscreen: true,     // 윈도우 전체 화면 활성화
    alwaysOnTop: false,    // 윈도우를 항상 다른 창들 위에 표시하지 않음
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // main 프로세스가 창 생성할 때 preload 지정. 렌더러 안에서 preload.js가 가장 먼저 실행된다.
      //nodeIntegration: false, // Node resuires 금지
      contextIsolation: true, // contextBridge 강제
      enableRemoteModule: false
    }
  });

  win.loadFile(path.join(__dirname, "../../index.html"));   // 창에 표시할 내용을 불러옴. index.html이 Electron 창 안에서 "앱의 첫 화면"이 된다.

  win.on("closed", () => {
    win = null;
  });
}

module.exports = createWindow;