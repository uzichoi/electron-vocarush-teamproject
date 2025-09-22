// ComboEffect.js
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ComboEffect({ combo }) {
  useEffect(() => {
    const options = { useWorker: false }; // Worker 사용 안함
    if (combo === 2) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, ...options });
    } else if (combo === 3) {
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.7 }, ...options });
    } else if (combo >= 4) {
      confetti({ 
        particleCount: 120, 
        spread: 160, 
        startVelocity: 45,
        origin: { y: 0.6 },
        ...options,
        useWorker: false,

      });
    }
  }, [combo]);

  return null; // 렌더링할 필요 없음
}
