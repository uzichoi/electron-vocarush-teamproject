import React from "react";
import { useNavigate } from "react-router-dom";

export default function ResultView() {
    const navigate = useNavigate();

    const gameResult = {
        gameTime: "4:32",
        totalWords: 5,
        foundWords: 5,
        player1: {
            name: "Player 1",
            score: 2850,
            wordsFound: 2,
            maxCombo: 5,
            accuracy: 85,
            isWinner: true
        },
        player2: {
            name: "Player 2",
            score: 2100,
            wordsFound: 3,
            maxCombo: 3,
            accuracy: 72,
            isWinner: false
        }
    };

    const generateResultGrid = () => {
        const grid = [];
        for (let i = 0; i < 10; i++) {
            const row = [];
            for (let j = 0; j < 10; j++) {
                if (i === 2 && j >= 1 && j <= 5) {
                    row.push({ letter: "HELLO"[j-1], foundBy: "player1" });
                } else if (i === 5 && j >= 3 && j <= 7) {
                    row.push({ letter: "WORLD"[j-3], foundBy: "player2" });
                } else if (i === 7 && j >= 2 && j <= 6) {
                    row.push({ letter: "REACT"[j-2], foundBy: "none" });
                } else if (Math.random() < 0.2) {
                    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    row.push({ 
                        letter: letters[Math.floor(Math.random() * letters.length)], 
                        foundBy: "none" 
                    });
                } else {
                    row.push({ letter: '*', foundBy: "none" });
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
                <div className="header-left">
                    <button className="btn-small" onClick={() => {navigate('/game')}}>← BACK</button>
                </div>
                <div className="header-center">
                    <h1 className="result-title">GAME RESULT</h1>
                </div>
            </header>

            <main className="result-main">
                <div className="result-content">
                    {/* 플레이어 1 */}
                    <section className="player-section">
                        <div className="player-final">
                            {gameResult.player1.isWinner && (
                                <div className="winner-crown" aria-label="승자">👑</div>
                            )}
                            <div className="player-avatar">📷</div>
                            <h3 className="player-name">{gameResult.player1.name}</h3>
                            <div className="final-score">{gameResult.player1.score.toLocaleString()}</div>
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
                                                className={`grid-cell ${cell.letter !== '*' ? 'letter' : 'empty'} ${cell.foundBy !== 'none' ? `found-by-${cell.foundBy}` : 'unfound'}`}
                                            >
                                                {cell.letter !== '*' ? cell.letter : ''}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                    {/* 게임 통계를 게임 보드 하단에 배치 */}
                    {/*
                        <div className="match-stats">
                            <div className="stat-row">게임 시간: {gameResult.gameTime}</div>
                            <div className="stat-row">전체 단어: {gameResult.totalWords}개</div>
                            <div className="stat-row">발견 단어: {gameResult.foundWords}개</div>
                        </div> */}
                    </section>

                    {/* 플레이어 2 */}
                    <section className="player-section">
                        <div className="player-final">
                            {gameResult.player2.isWinner && (
                                <div className="winner-crown" aria-label="승자">👑</div>
                            )}
                            <div className="player-avatar">📷</div>
                            <h3 className="player-name">{gameResult.player2.name}</h3>
                            <div className="final-score">{gameResult.player2.score.toLocaleString()}</div>
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
                    <button className="btn-secondary" onClick={() => navigate('/ranking')}>View Ranking</button>
                    <button className="btn-secondary" onClick={() => navigate('/start')}>Restart</button>
                    <button className="btn-secondary" onClick={() => navigate('/start')}>Next Round</button>
                </section>
            </main>
        </div>
    );
}