import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Ranking from "../models/Ranking";  // 모델 불러오기


export default function RankingView() {
  const navigate = useNavigate();
  const [rankingData, setRankingData] = useState([]);

  useEffect(() => {
    Ranking.load(); // 파일에서 불러오기
    const entries = Ranking.getTopEntries(20);

    let lastScore = null;
    let lastRank = 0;

    const ranked = entries.map((entry,idx) => {

      if(entry.score === lastScore) {
        return{...entry, rank: lastRank};
      }else{
        lastScore = entry.score;
        lastRank = idx+1;
        return{...entry, rank:lastRank};
      }
    });
    setRankingData(ranked);
  }, []);


  const formatDate = (dateString) => {
    if(!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year.slice(2)}-${month}-${day}`;
  };

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
            {rankingData.map((player, idx) => (
              <div key={`${player.name}-${player.score}-${idx}`} className="ranking-item">
                <div className="rank-number">#{player.rank}</div>
                <div className="player-name">{player.name}
                  <span className="player-date">{formatDate(player.date)}</span>
                </div>
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
