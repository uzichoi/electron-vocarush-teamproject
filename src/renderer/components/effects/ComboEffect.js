// ComboEffect.js
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ComboEffect({ combo }) {
  useEffect(() => {
    if (!combo || combo < 2) return;

    const baseOptions = {
      useWorker: false,
      decay: 0.9,     // 입자 크기가 줄어드는 속도
      gravity: 0.8,   // 입자가 떨어지는 속도
      ticks: 150,     // 애니메이션 프레임 (약 3초 후 완전 사라짐)
    };

    if (combo === 2) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        ...baseOptions,
      });
    } else if (combo === 3) {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.7 },
        ...baseOptions,
      });
    } else if (combo >= 4) {
      confetti({
        particleCount: 120,
        spread: 160,
        startVelocity: 45,
        origin: { y: 0.6 },
        ...baseOptions,
      });
    }
  }, [combo]);

  return null;
}