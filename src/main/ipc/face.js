// main/ipc/face.js (메인 프로세스)
// 렌더러(React)에서 window.ElectronAPI.captureFace(name)를 호출하면,
// ipcMain.handle('face:capture', …)가 파이썬 스크립트(faces_capture.py)를 child_process.spawn으로 실행 → 표준출력/종료코드로 성공 여부와 저장된 이미지 경로를 받아서 렌더러로 반환

const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

ipcMain.handle('face:capture', async (_evt, name) => {
  const script = path.join(__dirname, '..', 'python', 'faces_capture.py');

  return await new Promise((resolve, reject) => {
    const p = spawn('python3', [script, name], { env: { ...process.env } });
    let out = ''; let err = '';

    p.stdout.on('data', d => (out += d.toString()));
    p.stderr.on('data', d => (err += d.toString()));
    
    p.on('close', code => {
      if (code === 0) {
        // Python에서 "SAVE_PATH: /abs/path.jpg"처럼 찍어주면 파싱
        const m = out.match(/SAVE_PATH:(.*)/);
        resolve(m ? m[1].trim() : null);
      } else {
        reject(new Error(err || 'face capture failed'));
      }
    });
  });
});


