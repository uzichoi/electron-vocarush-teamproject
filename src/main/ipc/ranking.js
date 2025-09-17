const { ipcRenderer, app, ipcMain } = require("electron");
const path = require("path");
const fs = requre("fs");

const rankingFile = app.isPackaged 
    ? path.join(process.resourcesPath, "renderer", "assets", "ranking", "ranking.json")
    : path.join(__dirname, "..", "..", "renderer", "assets", "ranking", "ranking.json");

ipcMain.handle("ranking:read", async () => {
    try {
        if(!fs.existsSync(rankingFile)) return [];  // 파일 존재하지 않으면 빈 문자열 리턴
        const raw = fs.readFileSync(rankingFile, "utf-8");  // rankingFile을 "utf-8" 인코딩 방식으로 읽기
        return JSON.parse(raw); // JSON 문자열 구문 분석 후, 그 결과에서 js 값 혹은 객체 생성하여 반환
    } catch (e) {   
        console.error("ranking:read failed: ", e);    // 파일 읽기 실패 오류
        return [];
    }
});

ipcMain.handle("ranking:write", async(_evt, data) => {
    try {
        fs.writeFileSync(rankingFile, JSON.stringify(data, null, 2), "utf-8"); // js 값 혹은 객체를 JSON 문자열로 변환히여, 파일을 동기적으로 생성한다.
        // fs.writeFileSync(file, data[, options]); -> 파일명, 파일에 기록할 데이터, 인코딩 방식
        return true;
    } catch (e) {
        console.error("ranking:write failed: ", e);
        return false;
    }
});