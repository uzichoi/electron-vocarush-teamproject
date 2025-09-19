import React from "react";
import { motion } from "framer-motion";

export default function BalloonEffect({ combo }) {
  if (combo < 4) return null;

  const containerStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    zIndex: 3000,
    overflow: "hidden", // ✅ 스크롤 방지
  };

  const balloonStyle = {
    fontSize:combo >= 5 ? "4rem" : "2.5rem",
    position : "absolute",
  };

  // 🎯 콤보 단계에 따라 풍선 개수 & 크기 변경
  const balloonCount = combo === 4 ? 10 : 20;
  const fontSize = combo === 4 ? "2rem" : "3.5rem";

  return (
    <div style={containerStyle}>
      {[...Array(balloonCount)].map((_, i) => {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 150 + Math.random() * 250;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance * -1;

        return (
          <motion.div
            key={i}
            style={{ ...balloonStyle, fontSize }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
            animate={{
              x: endX,
              y: endY,
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{
              duration: 2.5,
              ease: "easeOut",
              delay: i * 0.05,
            }}
          >
            🎈
          </motion.div>
        );
      })}
    </div>
  );
}
