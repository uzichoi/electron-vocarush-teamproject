import React from "react";
import { useNavigate } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";


export default function GameView() {
  const navigate = useNavigate();
  const { controller, state } = useGameController();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    controller.submitInput(state.inputValue);
  };

  return (
    <div className="game-view">
      <header className="game-header">
        <div className="header-left"><div className="game-title">VOCARUSH</div></div>
        <div className="header-center"><div className="game-timer">{formatTime(state.timeIncreased)}</div></div>
        <div className="header-right">
          <button className="btn-small" onClick={() => navigate("/result")}>Quit</button>
        </div>
      </header>

      <main className="game-main">
        {/* Player 1 */}
        <div className="player-info">
          <div className="player-card">
            <h3>Player 1</h3>
            <div className="stat"><span>Name:</span> {state.player1.name}</div>
            <div className="stat"><span>Score:</span> {state.player1.score}</div>
            <div className="stat"><span>Combo:</span> {state.player1.combo}</div>
            <div className="stat"><span>HP:</span>
              <div className="hp-bar">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`hp-heart ${i < state.player1.hp ? "active" : ""}`}>♥</div>
                ))}
              </div>
            </div>
            <button
              className={`turn-btn ${state.currentTurn === "player1" && state.turnActive ? "active" : ""}`}
              onClick={() => controller.startTurn("player1")}
            >
              My Turn
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="game-board">
          <div
            className="word-grid"
            style={{ gridTemplateColumns: `repeat(${state.grid[0]?.length || 6}, var(--cell-size))` }}
          >
            {state.grid.map((row, i) => (
              <div key={i} className="grid-row">
                {row.map((cell, j) => (
                  <div key={j} className={`grid-cell ${cell !== "*" ? "letter" : "empty"}`}>{cell}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Player 2 */}
        <div className="player-info">
          <div className="player-card">
            <h3>Player 2</h3>
            <div className="stat"><span>Name:</span> {state.player2.name}</div>
            <div className="stat"><span>Score:</span> {state.player2.score}</div>
            <div className="stat"><span>Combo:</span> {state.player2.combo}</div>
            <div className="stat"><span>HP:</span>
              <div className="hp-bar">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`hp-heart ${i < state.player2.hp ? "active" : ""}`}>♥</div>
                ))}
              </div>
            </div>
            <button
              className={`turn-btn ${state.currentTurn === "player2" && state.turnActive ? "active" : ""}`}
              onClick={() => controller.startTurn("player2")}
            >
              My Turn
            </button>
          </div>
        </div>
      </main>

      {/* Input + 턴 타이머 */}
      <footer className="game-input">
        {state.turnActive && (
          <div className="turn-timer">
            <div className="turn-timer-fill" style={{ width: `${(state.turnTime / 10) * 100}%` }} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <span className="input-label">Input &gt;&gt;</span>
            <input
              type="text"
              value={state.inputValue}
              onChange={(e) => controller.setInputValue(e.target.value)}
              disabled={!state.turnActive}
              className="word-input"
              placeholder="Type your word..."
            />
            <button type="submit" className="btn btn-primary submit-btn">SUBMIT</button>
          </div>
        </form>
      </footer>
    </div>
  );
}
