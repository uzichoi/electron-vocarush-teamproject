// ComboTextEffect.js
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ComboTextEffect({ combo, player }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (combo >= 2) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 1000); // 1초 뒤 사라짐
      return () => clearTimeout(timer);
    }
  }, [combo]);

  const colors = {
    player1: "#3b82f6", // 파랑
    player2: "#ec4899", // 핑크
  };

  // 플레이어별 위치 조정
  const positions = {
    player1: {
      top: "35%",   // 화면 위쪽 35% 지점
      left: "30%",  // 왼쪽 카드 근처
      transform: "translate(-50%, -50%)",
    },
    player2: {
      top: "35%",
      left: "60%",  // 오른쪽 카드 근처
      transform: "translate(-50%, -50%)",
    },
    
  };

  return (
  <AnimatePresence>
    {combo >= 2 && show && (
      <motion.div
        key={combo}
        initial={{ opacity: 0, scale: 0.5, y: 0 }}
        animate={{ opacity: 0.85, scale: 2.2, y: -60 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          position: "absolute",
          ...positions[player],
          fontSize: "4rem",
          fontWeight: "900",
          color: colors[player] || "#fff",
          pointerEvents: "none",
          textShadow: "0 0 12px rgba(255,255,255,0.9)",
          zIndex: 3000,
          whiteSpace: "nowrap",
        }}
      >
        {combo} COMBO!
      </motion.div>
    )}
  </AnimatePresence>
);
}
