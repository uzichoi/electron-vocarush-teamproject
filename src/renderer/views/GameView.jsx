import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";

export default function GameView() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const { controller, state } = useGameController();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let mounted = true;

    async function startGame() {
      if (!mounted) return;

      if (location.state?.nextRound) {
        await controller.restartGame({
          difficulty: (location.state.difficulty ?? 0) + 1,
        });
      } else {
        await controller.startInitialGame();
      }
    }

    startGame();
    return () => {
      mounted = false;
    };
  }, [controller, location.key]);

  const handleSubmit = (e) => {
    e.preventDefault();
    controller.submitInput(state.inputValue);
  };

  const handleQuitToResult = () => {
    navigate("/result", {
      state: {
        player1: state.player1,
        player2: state.player2,
        gameTime: state.timeIncreased,
        grid: state.grid,
        highlight: controller.board.highlight,
        placedWordCheck: controller.board.placedWordCheck,
        difficulty: controller.currentGameDifficulty,
      },
    });
  };

  const handleQuit = () => {
    controller.unmount();
    navigate("/start", { replace: true });
  };

  return (
    <div className="game-view">
      <header className="game-header">
        <div className="header-left">
          <div className="game-title">VOCARUSH</div>
        </div>
        <div className="header-center">
          <div className="game-timer">{formatTime(state.timeIncreased)}</div>
        </div>
        <div className="header-right">
          <button className="btn-small" onClick={handleQuitToResult}>
            Quit
          </button>
        </div>
      </header>

      <main className="game-main">
        {/* Player 1 */}
        <div className="player-info">
          <div className="avatar-large player1-avatar">
            {state.player1.photo || "👤"}
          </div>
          <div className="player-card player1-card">
            <h3>{state.player1.name || "Player 1"}</h3>
            <div className="stat">
              <span>Score:</span> {state.player1.score}
            </div>
            <div className="stat">
              <span>Combo:</span> {state.player1.combo}
            </div>
            <div className="stat">
              <span>HP:</span>
              <div className="hp-bar">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`hp-heart ${i < state.player1.hp ? "active" : ""}`}
                  >
                    ♥
                  </div>
                ))}
              </div>
            </div>
            <button
              className={`turn-btn ${
                state.currentTurn === 0 && state.turnActive ? "active" : ""
              }`}
              onClick={() => controller.startTurn(0)}
              disabled={state.turnActive || state.player1.hp <= 0}
            >
              My Turn
            </button>
          </div>
        </div>

        {/* Game Board */}
        <div className="game-board">
          <div className="word-grid">
            {state.grid.map((row, i) => (
              <div key={i} className="grid-row">
                {row.map((cell, j) => {
                  let cellClass = "grid-cell";
                  cellClass += cell !== "*" ? " letter" : " empty";

                  const player = state.highlight?.[i]?.[j];
                  if (player === 0) cellClass += " found-by-player1";
                  else if (player === 1) cellClass += " found-by-player2";

                  return (
                    <div key={j} className={cellClass}>
                      {cell}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Player 2 */}
        <div className="player-info">
          <div className="avatar-large player2-avatar">
            {state.player2.photo || "👤"}
          </div>
          <div className="player-card player2-card">
            <h3>{state.player2.name || "Player 2"}</h3>
            <div className="stat">
              <span>Score:</span> {state.player2.score}
            </div>
            <div className="stat">
              <span>Combo:</span> {state.player2.combo}
            </div>
            <div className="stat">
              <span>HP:</span>
              <div className="hp-bar">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`hp-heart ${i < state.player2.hp ? "active" : ""}`}
                  >
                    ♥
                  </div>
                ))}
              </div>
            </div>
            <button
              className={`turn-btn ${
                state.currentTurn === 1 && state.turnActive ? "active" : ""
              }`}
              onClick={() => controller.startTurn(1)}
              disabled={state.turnActive || state.player2.hp <= 0}
            >
              My Turn
            </button>
          </div>
        </div>
      </main>

      <footer className="game-input">
        {state.turnActive && (
          <div className="turn-timer">
            <div
              className="turn-timer-fill"
              style={{ width: `${(state.turnTime / 10) * 100}%` }}
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <span className="input-label">Input &gt;&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={state.inputValue}
              onChange={(e) => controller.setInputValue(e.target.value)}
              disabled={!state.turnActive}
              className="word-input"
              placeholder="Type your word..."
            />
            <button type="submit" className="btn btn-primary submit-btn">
              SUBMIT
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}