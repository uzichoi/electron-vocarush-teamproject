import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Ranking from "../models/Ranking";  // 모델 불러오기
import SoundManager from "../models/SoundManager";

export default function RankingView() {
  const navigate = useNavigate();
  const [rankingData, setRankingData] = useState([]);

  useEffect(() => {
    Ranking.load(); // 파일에서 불러오기
    const entries = Ranking.getTopEntries(100);

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

    useEffect(() => {
      SoundManager.playBgm("rankingBgm"); // 마운트 시 BGM 재생
    
      return () => {
      // 👇 Ranking 페이지로 이동할 때는 끊지 않음
      // 👇 결과뷰에서 다른 곳으로 이동할 때만 정지
      if (location.pathname !== "/ranking") {
        SoundManager.stopBgm();
      }
      };
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
            onClick={() => {SoundManager.play("clickPop");sessionStorage.setItem("fromBack", "true");navigate(-1);}}
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
