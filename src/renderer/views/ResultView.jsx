import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameController } from "../controller/GameController"; // ✅ 인스턴스 import

export default function ResultView() {
  const navigate = useNavigate();
  const [gameResult, setGameResult] = useState(null); // ✅ 오타 수정

  useEffect(() => {
    const unsub = gameController.subscribe((state) => {
      if (state.gameOver) {
        setGameResult({
          gameTime: state.timeIncreased,
          player1: {
            name: state.player1.getName(),
            score: state.player1.getScore(),
            maxCombo: state.player1.getMaxCombo(),
            isWinner: state.player1.getScore() > state.player2.getScore(),
            wordsFound: state.player1.getWordsFound?.() ?? 0,
            accuracy: state.player1.getAccuracy?.() ?? 0,
          },
          player2: {
            name: state.player2.getName(),
            score: state.player2.getScore(),
            maxCombo: state.player2.getMaxCombo(),
            isWinner: state.player2.getScore() > state.player1.getScore(),
            wordsFound: state.player2.getWordsFound?.() ?? 0,
            accuracy: state.player2.getAccuracy?.() ?? 0,
          },
        });
      }
    });
    return () => unsub();
  }, []);

  if (!gameResult) {
    return <div>결과를 불러오는 중...</div>;
  }

  // ✅ mm:ss 포맷 함수
  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const generateResultGrid = () => {
    const grid = [];
    for (let i = 0; i < 10; i++) {
      const row = [];
      for (let j = 0; j < 10; j++) {
        if (i === 2 && j >= 1 && j <= 5) {
          row.push({ letter: "HELLO"[j - 1], foundBy: "player1" });
        } else if (i === 5 && j >= 3 && j <= 7) {
          row.push({ letter: "WORLD"[j - 3], foundBy: "player2" });
        } else if (i === 7 && j >= 2 && j <= 6) {
          row.push({ letter: "REACT"[j - 2], foundBy: "none" });
        } else if (Math.random() < 0.2) {
          const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          row.push({
            letter: letters[Math.floor(Math.random() * letters.length)],
            foundBy: "none",
          });
        } else {
          row.push({ letter: "*", foundBy: "none" });
        }
      }
      grid.push(row);
    }
    return grid;
  };

  const resultGrid = generateResultGrid();

  return (
    <div className="result-view">
      <header className="result-header">
        <div className="header-center">
          <h1 className="result-title">GAME RESULT</h1>
          {/* ✅ 게임 시간 표시 */}
          <div className="final-time">⏱ {formatTime(gameResult.gameTime)}</div>
        </div>
      </header>

      <main className="result-main">
        <div className="result-content">
          {/* 플레이어 1 */}
          <section className="player-section">
            <div className="player-final">
              {gameResult.player1.isWinner && (
                <div className="winner-crown" aria-label="승자">
                  👑
                </div>
              )}
              <div className="player-avatar">📷</div>
              <h3 className="player-name">{gameResult.player1.name}</h3>
              <div className="final-score">
                {gameResult.player1.score.toLocaleString()}
              </div>
              <div className="player-stats">
                <div className="stat-item">
                  <span>단어:</span> {gameResult.player1.wordsFound}개
                </div>
                <div className="stat-item">
                  <span>콤보:</span> {gameResult.player1.maxCombo}
                </div>
                <div className="stat-item">
                  <span>정확도:</span> {gameResult.player1.accuracy}%
                </div>
              </div>
              {gameResult.player1.maxCombo >= 5 && (
                <div className="achievement-badges">🔥 HOT STREAK</div>
              )}
            </div>
          </section>

          {/* 게임 보드 섹션 */}
          <section className="result-board-section">
            <div className="board-title">Found Words</div>
            <div className="enhanced-game-board">
              <div className="result-grid">
                {resultGrid.map((row, i) => (
                  <div key={i} className="grid-row">
                    {row.map((cell, j) => (
                      <div
                        key={j}
                        className={`grid-cell ${
                          cell.letter !== "*" ? "letter" : "empty"
                        } ${
                          cell.foundBy !== "none"
                            ? `found-by-${cell.foundBy}`
                            : "unfound"
                        }`}
                      >
                        {cell.letter !== "*" ? cell.letter : ""}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 플레이어 2 */}
          <section className="player-section">
            <div className="player-final">
              {gameResult.player2.isWinner && (
                <div className="winner-crown" aria-label="승자">
                  👑
                </div>
              )}
              <div className="player-avatar">📷</div>
              <h3 className="player-name">{gameResult.player2.name}</h3>
              <div className="final-score">
                {gameResult.player2.score.toLocaleString()}
              </div>
              <div className="player-stats">
                <div className="stat-item">
                  <span>단어:</span> {gameResult.player2.wordsFound}개
                </div>
                <div className="stat-item">
                  <span>콤보:</span> {gameResult.player2.maxCombo}
                </div>
                <div className="stat-item">
                  <span>정확도:</span> {gameResult.player2.accuracy}%
                </div>
              </div>
              {gameResult.player2.maxCombo >= 5 && (
                <div className="achievement-badges">🔥 HOT STREAK</div>
              )}
            </div>
          </section>
        </div>

        {/* 액션 버튼들 */}
        <section className="result-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate("/ranking")}
          >
            View Ranking
          </button>
          <button className="btn-secondary" onClick={() => navigate("/start")}>
            Restart
          </button>
          <button className="btn-secondary" onClick={() => navigate("/start")}>
            Next Round
          </button>
        </section>
      </main>
    </div>
  );
}
