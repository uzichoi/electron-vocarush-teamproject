import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RankingView() {
  const navigate = useNavigate();
  const [rankingData, setRankingData] = useState([]);

  useEffect(() => {
    async function fetchRanking() {
      const result = await window.electronAPI.readRanking();
      if (!result.ok) {
        console.error("랭킹 파일 읽기 실패:", result.error.message);
        console.error("파일 경로:", result.error.pathTried);
        return;
      }

      const entries = result.rankings || [];
      let lastScore = null;
      let lastRank = 0;

      const ranked = entries
        .sort((a, b) => b.score - a.score)
        .map((entry, idx) => {
          if (entry.score === lastScore) {
            return { ...entry, rank: lastRank };
          } else {
            lastScore = entry.score;
            lastRank = idx + 1;
            return { ...entry, rank: lastRank };
          }
        });

      setRankingData(ranked);
    }

    fetchRanking();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year.slice(2)}-${month}-${day}`;
  };

  const handleClearRanking = async () => {
    const result = await window.electronAPI.writeRanking([]);
    if (!result.ok) {
      console.error("랭킹 초기화 실패:", result.error.message);
    } else {
      setRankingData([]);
    }
  };

  return (
    <div className="ranking-view">
      <header className="ranking-header">
        <div className="header-left"></div>
        <div className="header-center">
          <div className="ranking-title">RANKING</div>
        </div>
        <div className="header-right">
          <button className="btn-small" onClick={() => navigate(-1)} aria-label="close">
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
                <div className="player-name">
                  {player.name}
                  <span className="player-date">{formatDate(player.date)}</span>
                </div>
                <div className="player-score">{player.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
