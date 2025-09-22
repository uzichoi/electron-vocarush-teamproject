// main/ipc/face.js

const { ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

const PY = process.platform === "win32" ? "python" : "python3";

ipcMain.handle("face:capture", async (_evt, name) => {
  const script = path.join(__dirname, "..", "python", "faces_capture.py");

  return await new Promise((resolve) => {
    const p = spawn(PY, [script, name], { env: { ...process.env } });

    let out = "";
    let err = "";

    p.on("error", (e) => {  // spawn 자체 실패(예: python3 없음)
       resolve({
        code: -1,
        savePath: null,
        stdout: out,
        stderr: `spawn error: ${e.message}`
      });
    });

    p.stdout.on("data", d => (out += d.toString()));
    p.stderr.on("data", d => (err += d.toString()));

    p.on("close", (code) => {
      console.log("Python stdout: ", out);
      console.log("Python stderr: ", err);
      console.log("Python exit code: ", code);

      const m = out.match(/SAVE_PATH:\s*(.*)/);
      const savePath = m ? m[1].trim() : null;

      // reject 쓰지 말고 항상 결과 객체 resolve
      resolve({ code, savePath, stdout: out, stderr: err });
    });
  });
});
