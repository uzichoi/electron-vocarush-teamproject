import React from "react";
import { useNavigate } from "react-router-dom";

export default function RankingView() {
    const navigate = useNavigate();

    // 임시 랭킹 데이터 (추후 모델에서 가져올 예정)
    const rankingData = [
        { rank: 1, name: "Frank", score: 9850 },
        { rank: 2, name: "Player B", score: 9200 },
        { rank: 3, name: "Alice", score: 8750 },
        { rank: 4, name: "Bob", score: 8300 },
        { rank: 5, name: "Charlie", score: 7900 },
        { rank: 6, name: "David", score: 7500 },
        { rank: 7, name: "Eve", score: 7100 },
        { rank: 8, name: "Player A", score: 6800 },
        { rank: 9, name: "Grace", score: 6400 },
        { rank: 10, name: "Henry", score: 6000 },
        { rank: 11, name: "Ivy", score: 5600 },
        { rank: 12, name: "Jack", score: 5200 },
    ];

    // 현재 라운드 참가자 (추후 props나 state로 받을 예정)
    const currentPlayers = ["Player A", "Player B"];

    return(
        <div className="ranking-view">
            <header className="ranking-header">
                <div className="header-left"></div>
                <div className="header-center">
                    <div className="ranking-title">RANKING</div>
                </div>
                <div className="header-right">
                    <button className="btn-small" onClick={() => navigate('/result')} aria-label="close">×</button>
                </div>
            </header>
            <main className="ranking-content">
                <div className="ranking-box">
                    <div className="ranking-list">
                        {rankingData.map((player) => (
                            <div 
                                key={player.rank} 
                                className={`ranking-item ${
                                    currentPlayers.includes(player.name) 
                                        ? 'highlight' 
                                        : ''
                                }`}
                            >
                                <div className="rank-number">#{player.rank}</div>
                                <div className="player-name">{player.name}</div>
                                <div className="player-score">{player.score.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}