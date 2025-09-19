import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ComboEffect({ combo }) {
  useEffect(() => {
    // body에 캔버스가 없으면 하나 생성
    let canvas = document.getElementById("confetti-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "confetti-canvas";
      canvas.style.position = "fixed";
      canvas.style.top = 0;
      canvas.style.left = 0;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = 9999;
      document.body.appendChild(canvas);
    }

    const myConfetti = confetti.create(canvas, { resize: true, useWorker: false });

    if (combo === 2) {
      myConfetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } else if (combo === 3) {
      myConfetti({ particleCount: 80, spread: 100, origin: { y: 0.7 } });
    } else if (combo >= 4) {
      myConfetti({
        particleCount: 120,
        spread: 160,
        startVelocity: 45,
        origin: { y: 0.6 },
      });
    }
  }, [combo]);

  return null;
}
