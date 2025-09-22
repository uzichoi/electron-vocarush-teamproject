const { ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

ipcMain.handle("face:capture", async (_evt, name) => {
  const script = path.join(__dirname, "..", "python", "faces_capture.py");

  return await new Promise((resolve, reject) => {
    const p = spawn("python3", [script, name], { env: { ...process.env } });
    let out = "";
    let err = "";

    p.stdout.on("data", (d) => {
      out += d.toString();
    });
    p.stderr.on("data", (d) => {
      err += d.toString();
    });

    p.on("close", (code) => {
      console.log("📷 Python stdout:\n", out);
      console.log("📷 Python stderr:\n", err);
      console.log("📷 Python exit code:", code);

      if (code === 0) {
        // SAVE_PATH 라인을 추출 (개행·공백 대응)
        const m = out.match(/SAVE_PATH:\s*(.*)/);
        if (m) {
          resolve(m[1].trim());
        } else {
          console.warn("⚠️ SAVE_PATH 라인을 찾지 못했습니다.");
          resolve(null);
        }
      } else {
        reject(new Error(err || "face capture failed"));
      }
    });
  });
});
