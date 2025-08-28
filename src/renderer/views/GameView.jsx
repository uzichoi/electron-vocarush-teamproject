import React, { useEffect } from "react";
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

  useEffect(() => {
        // 마운트 시 초기 게임만 실행 (restartGame X)
        let mounted = true;

        async function startInitial() {
             if (!mounted) return;
            await controller.startInitialGame();
        }
        startInitial();

        return () => {
            mounted = false;
        };
        
    }, [controller]);

    const handleSubmit = (e) => {
        e.preventDefault();
        controller.submitInput(state.inputValue);
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
                    <button className="btn-small" onClick={() => navigate("/result")}>
                        Quit
                    </button>
                </div>
            </header>

            <main className="game-main">
                {/* Left Player */}
                <div className="player-info">
                    <div className="player-photo">
                        <div className="photo-placeholder">
                            <span>📷</span>
                        </div>
                    </div>
                    <div className="player-card">
                        <h3>Player 1</h3>
                        <div className="stat">
                            <span>Name:</span> <span className="value">{state.player1.name}</span>
                        </div>
                        <div className="stat">
                            <span>Score:</span> <span className="value score">{state.player1.score}</span>
                        </div>
                        <div className="stat">
                            <span>Combo:</span> <span className="value combo">{state.player1.combo}</span>
                        </div>
                        <div className="stat">
                            <span>Max Combo:</span> <span className="value">{state.player1.maxCombo}</span>
                        </div>
                        <div className="stat">
                            <span>HP:</span>
                            <div className="hp-bar">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className={`hp-heart ${i < state.player1.hp ? "active" : ""}`}>♥</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Board */}
                <div className="game-board">
                    <div className="word-grid">
                        {state.grid.map((row, i) => (
                            <div key={i} className="grid-row">
                                {row.map((cell, j) => (
                                    <div
                                        key={j}
                                        className={`grid-cell ${cell !== "*" ? "letter" : "empty"} ${state.highlight && state.highlight[i] && state.highlight[i][j] ? "highlight" : ""}`}
                                    >
                                        {cell}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Player */}
                <div className="player-info">
                    <div className="player-photo">
                        <div className="photo-placeholder">
                            <span>📷</span>
                        </div>
                    </div>
                    <div className="player-card">
                        <h3>Player 2</h3>
                        <div className="stat">
                            <span>Name:</span> <span className="value">{state.player2.name}</span>
                        </div>
                        <div className="stat">
                            <span>Score:</span> <span className="value score">{state.player2.score}</span>
                        </div>
                        <div className="stat">
                            <span>Combo:</span> <span className="value combo">{state.player2.combo}</span>
                        </div>
                        <div className="stat">
                            <span>Max Combo:</span> <span className="value">{state.player2.maxCombo}</span>
                        </div>
                        <div className="stat">
                            <span>HP:</span>
                            <div className="hp-bar">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className={`hp-heart ${i < state.player2.hp ? "active" : ""}`}>♥</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Input */}
            <footer className="game-input">
                <form onSubmit={handleSubmit} className="input-form">
                    <div className="input-container">
                        <span className="input-label">Input &gt;&gt;</span>
                        <input
                            type="text"
                            value={state.inputValue}
                            onChange={(e) => controller.setInputValue(e.target.value)}
                            className="word-input"
                            placeholder="Type your word..."
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary submit-btn">SUBMIT</button>
                    </div>
                </form>
            </footer>
        </div>
    );
}