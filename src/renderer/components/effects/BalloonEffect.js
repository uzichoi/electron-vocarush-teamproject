import React from "react";
import { motion } from "framer-motion";

export default function BalloonEffect({ combo }) {
  if (combo < 3) return null;

  const containerStyle = {
    position: "fixed",
    bottom: "75%",
    left: "50%",
    transform: "translate(-50%, 50%)",
    pointerEvents: "none",
    zIndex: 3000,
  };

  const balloonStyle = {
    fontSize: "2.5rem",
    position: "absolute",
  };

  return (
    <div style={containerStyle}>
      {[...Array(15)].map((_, i) => {
        // 🎯 각 풍선이 퍼져 나갈 방향 (좌우, 상하 랜덤)
        const angle = Math.random() * 2 * Math.PI; 
        const distance = 200 + Math.random() * 200; // 확산 거리
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance * -1.3; // 위쪽으로 날아가게 음수

        return (
          <motion.div
            key={i}
            style={balloonStyle}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
            animate={{
              x: endX,
              y: endY,
              opacity: [0, 1, 0], // 투명 → 선명 → 투명
              scale: [0.5, 1.2, 0.8], // 팡! 하고 커졌다가 작아짐
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
          >
            🎈
          </motion.div>
        );
      })}
    </div>
  );
}
