import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Ranking from "../models/Ranking";  // 모델 불러오기

export default function RankingView() {
  const navigate = useNavigate();
  const [rankingData, setRankingData] = useState([]);

  useEffect(() => {
    Ranking.load(); // 파일에서 불러오기
    const top = Ranking.getTopEntries(20).map((entry, idx) => ({
      rank: idx + 1,
      ...entry,
    }));
    setRankingData(top);

    const stored= localStorage.getItem("lastWinners");
    if(stored){
        setHighLightPlayers(JSON.parse(stored));

        localStorage.removeItem("lastWinners");
    }
  }, []);

  return (
    <div className="ranking-view">
      <header className="ranking-header">
        <div className="header-left"></div>
        <div className="header-center">
          <div className="ranking-title">RANKING</div>
        </div>
        <div className="header-right">
          <button
            className="btn-small"
            onClick={() => navigate("/result")}
            aria-label="close"
          >
            ×
          </button>
        </div>
      </header>

      <main className="ranking-content">
        <div className="ranking-box">
          <div className="ranking-list">
            {rankingData.map((player) => (
              <div key={player.rank} className="ranking-item">
                <div className="rank-number">#{player.rank}</div>
                <div className="player-name">{player.name}</div>
                <div className="player-score">
                  {player.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
