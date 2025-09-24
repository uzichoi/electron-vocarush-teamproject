// HiddenWordBonusEffect.js
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function HiddenWordBonusEffect({ show, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
  if (show) {
    setVisible(true);

    const myConfetti = confetti.create(null, { useWorker: false });

    const candyConfetti = () => {
      const candies = ['🍬', '🍭', '🍫', '🧁', '🍩', '🎂'];
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          myConfetti({
            particleCount: 20,
            spread: 100,
            startVelocity: 30,
            origin: { x: 0.2 + (i * 0.15), y: 0.3 },
            colors: ['#ff6b9d', '#f7931e', '#fff200', '#c69c6d', '#8b4513', '#ff1493'],
          });
        }, i * 200);
      }
      setTimeout(() => {
        myConfetti({
          particleCount: 50,
          spread: 120,
          startVelocity: 45,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#ff6b9d', '#f7931e', '#fff200', '#c69c6d'],
        });
      }, 500);
    };

    candyConfetti();

    const timer = setTimeout(() => {
      setVisible(false);
      myConfetti.reset(); // 3초 후 정리
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      myConfetti.reset(); // 언마운트될 때도 정리
    };
  }
}, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, #ff6b9d, #f7931e)",
              pointerEvents: "none",
              zIndex: 9998,
            }}
          />
          
          {/* 메인 보너스 텍스트 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ 
              opacity: 1, 
              scale: [0.5, 1.2, 1], 
              y: 0,
              rotate: [0, 5, -5, 0]
            }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              scale: { times: [0, 0.6, 1] }
            }}
            style={{
              position: "fixed",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "4.5rem",
              fontWeight: "900",
              background: "linear-gradient(45deg, #ff6b9d, #fff200, #f7931e)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(255, 107, 157, 0.8)",
              pointerEvents: "none",
              zIndex: 9999,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            HIDDEN WORD!
          </motion.div>

          {/* 보너스 점수 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 150 }}
            animate={{ opacity: 1, scale: 1, y: 80 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              position: "fixed",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "3rem",
              fontWeight: "800",
              color: "#fff200",
              textShadow: "0 0 20px rgba(255, 242, 0, 0.9), 0 0 40px rgba(247, 147, 30, 0.6)",
              pointerEvents: "none",
              zIndex: 9999,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            +1000 BONUS!
          </motion.div>

          {/* 사탕 선물 메시지 */}
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 140 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              position: "fixed",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "1.8rem",
              fontWeight: "600",
              color: "#ffffff",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              pointerEvents: "none",
              zIndex: 9999,
              textAlign: "center",
            }}
          >
            🍬 You got candy! 🍭
          </motion.div>

          {/* 떠다니는 사탕들 */}
          {[...Array(12)].map((_, i) => {
            const candyEmojis = ['🍬', '🍭', '🍫', '🧁', '🍩'];
            const randomCandy = candyEmojis[Math.floor(Math.random() * candyEmojis.length)];
            const startX = Math.random() * 100;
            const endX = startX + (Math.random() - 0.5) * 60;
            const startY = 120;
            const endY = startY - Math.random() * 80 - 50;
            
            return (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: `${startX}vw`,
                  y: `${startY}vh`,
                  rotate: 0
                }}
                animate={{ 
                  opacity: [0, 1, 0.8, 0],
                  scale: [0, 1.5, 1, 0.8],
                  x: `${endX}vw`,
                  y: `${endY}vh`,
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2.5,
                  delay: Math.random() * 0.8,
                  ease: "easeOut"
                }}
                style={{
                  position: "fixed",
                  fontSize: "2.5rem",
                  pointerEvents: "none",
                  zIndex: 9999,
                }}
              >
                {randomCandy}
              </motion.div>
            );
          })}
        </>
      )}
    </AnimatePresence>
  );
}