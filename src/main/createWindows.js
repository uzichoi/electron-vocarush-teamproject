// src/main//createWindows.js
// 실제로 창을 띄우는 함수. 브라우저 창처럼 생긴 electron 윈도우를 하나 생성

import { BrowserWindow } from "electron";
import path from "path";

let win;

function createWindow() {
  win = new BrowserWindow({
    title: "VocaRush",
    resizable: false,     // 윈도우 크기 조절 비허용
    fullscreen: true,     // 윈도우 전체 화면 활성화
    alwaysOnTop: true,    // 윈도우를 항상 다른 창들 위에 표시
    webPreferences: {
        nodeIntegration: true,      // Node.js require 허용
        contextIsolation: false,     // context 간 분리 해제 (require 사용 가능)
        enableRemoteModule: false
      }
  });

  win.loadFile(path.join(__dirname, "../../index.html"));   // 창에 표시할 내용을 불러옴. index.html이 Electron 창 안에서 "앱의 첫 화면"이 된다.

  win.on("closed", () => {
    win = null;
  });
}

export default createWindow;
