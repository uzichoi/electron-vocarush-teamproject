import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";

export default function GameView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { controller, state } = useGameController();

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

  useEffect(() => {
        // 마운트 시 초기 게임만 실행 (restartGame X)
        let mounted = true;

        async function startGame() {
            if (!mounted) 
                return;
            if (location.state?.nextRound)  // ResultView에서 넘어올 때 nextRound: true면 라운드 재시작
                await controller.restartGame();
            else 
                await controller.startInitialGame();   // 그 외(첫 진입)는 초기 게임 시작
        }
     
        startGame();

        return () => {
            mounted = false;
        };
        
    }, [controller, location.state]);

    const handleSubmit = (e) => {
        e.preventDefault();
        controller.submitInput(state.inputValue);
    };

    const handleQuit = () => { // 진행된 보드 상태를 ResultView로 전달
    navigate("/result", {
    state: {
        grid: state.grid,                    // 진행된 보드
        highlight: controller.board.highlight,          // 정답 하이라이트
        placedWordCheck: controller.board.placedWordCheck, // 배치된 단어들
    },
  });
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
                    <button className="btn-small" onClick={handleQuit}>
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
                            {row.map((cell, j) => {
                            let cellClass = "grid-cell";

                            // 글자가 있는지 여부
                            cellClass += cell !== "*" ? " letter" : " empty";

                            // 플레이어별 하이라이트
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