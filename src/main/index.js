// Electron은 src/main/index.js부터 시작됨

import { app } from "electron";
import createWindow from "./createWindows.js";  // 확장자 명시 필요할 수도 있음

app.whenReady().then(() => {
    createWindow();     // 창 생성
});

app.on("activate", () => {
    // macOS에서 창이 모두 닫힌 후 앱 아이콘 클릭 시 다시 열기
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
