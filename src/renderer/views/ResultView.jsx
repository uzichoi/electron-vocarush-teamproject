// <<<<<<< HEAD

// import { useNavigate } from "react-router-dom";
// import { gameController } from "../controller/GameController"; // ✅ 인스턴스 import

// export default function ResultView() {
//   const navigate = useNavigate();
//   const [gameResult, setGameResult] = useState(null); // ✅ 오타 수정
// =======
// // views/ResultView.jsx

import React, { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { gameController } from "../controller/GameController"; // ✅ 인스턴스 import
import { useGameController } from "../hooks/useGameController";

export default function ResultView() {
    const navigate = useNavigate();
    const { state } = useGameController(); // state 정의
    const location = useLocation();
    const locState = location.state; // 여기서 locState 정의

  const [gameResult, setGameResult] = useState(() => {
    if (!locState) return null;
    const player1 = { ...locState.player1 };
    const player2 = { ...locState.player2 };

    const player1Score = player1.score ?? 0;
    const player2Score = player2.score ?? 0;

    player1.isWinner = player1Score > player2Score;
    player2.isWinner = player2Score > player1Score;

    return {
      player1,
      player2,
      gameTime: locState.gameTime ?? 0,
      grid: locState.grid,
      highlight: locState.highlight,
      placedWordCheck: locState.placedWordCheck,
      difficulty: locState.difficulty ?? 0,
    };
  });

  const { grid, highlight, placedWordCheck } = gameResult;
// =======
//     const [gameResult, setGameResult] = useState(() => {
//   return location.state
//     ? {
//         player1: locState.player1,
//         player2: locState.player2,
//         gameTime: locState.gameTime ?? 0,
//       }
//     : null;
// }); // 오타 수정
//   const { grid, highlight, placedWordCheck } = location.state;
// >>>>>>> playerconfig


  // Next Round 클릭 시 호출할 함수
const handleNextRound = () => {
    // 임시 경로를 거쳐서 강제로 GameView 재마운트
   // navigate("/start"); 
    setTimeout(() => {
        navigate("/game", { 
            state: { nextRound: true,
                    difficulty: location.state?.difficulty, // 현재 난이도 같이 전달
             } });
    }, 0);
};


// console.log("grid", grid);
// console.log("placedWordCheck", placedWordCheck);
// console.log("highlight", highlight);
// =======
// import { useNavigate } from "react-router-dom";
// import { gameController } from "../controller/GameController"; 

// export default function ResultView() {
//   const navigate = useNavigate();
//   const [gameResult, setGameResult] = useState(null); //
// >>>>>>> origin/rankingview

  useEffect(() => {
    //const unsub = gameController.subscribe((state) => {
      if (state.gameOver) {
        setGameResult({
          gameTime: state.timeIncreased,
          player1: {
            name: state.player1.getName(),
            score: state.player1.getScore(),
            maxCombo: state.player1.getMaxCombo(),
            isWinner: state.player1.getScore() > state.player2.getScore(),
            wordsFound: state.player1.getWordsFound?.() ?? 0,
            accuracy: state.player1.getAccuracy?.() ?? 0,
          },
          player2: {
            name: state.player2.getName(),
            score: state.player2.getScore(),
            maxCombo: state.player2.getMaxCombo(),
            isWinner: state.player2.getScore() > state.player1.getScore(),
            wordsFound: state.player2.getWordsFound?.() ?? 0,
            accuracy: state.player2.getAccuracy?.() ?? 0,
          },
        });
      }
    }, [state]);


  if (!gameResult) {
    return <div>결과를 불러오는 중...</div>;
  }

  // mm:ss 포맷 함수
  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

    return (
        <div className="result-view">
            <header className="result-header">
                {/* <div className="header-left">
                    <button className="btn-small" onClick={() => {navigate('/game')}}>← BACK</button>
                </div> */}
                <div className="header-center">
                    <h1 className="result-title">GAME RESULT</h1>
                    {/* ✅ 게임 시간 표시 */}
                    <div className="final-time">⏱ {formatTime(gameResult.gameTime)}</div>
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
                        <div className="result-board">
                            <div className="result-grid">
                                {grid.map((row, i) => (
                                <div key={i} className="grid-row">
                                    {row.map((cell, j) => {
                                    let cellClass = "grid-cell";


                                    // 글자가 있는지 여부
                                    cellClass += cell !== "*" ? " letter" : " empty";

                                    // 플레이어별 하이라이트
                                    const player = highlight?.[i]?.[j];
                                    if (player === 0) cellClass += " found-by-player1";
                                    else if (player === 1) cellClass += " found-by-player2";
                                    else if (player === -1 && placedWordCheck?.[i]?.[j])cellClass += " unfound-by-players";
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
                        <button className="btn-secondary" onClick={() => navigate("/ranking")}>
                        View Ranking
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/start')}>Restart</button>
                    <button className="btn-secondary" onClick={handleNextRound}>Next Round</button>
                </section>
            </main>
{/* =======
  return (
    <div className="result-view">
      <header className="result-header">
        <div className="header-center">
          <h1 className="result-title">GAME RESULT</h1>
          {/*게임 시간 표시 */}
          <div className="final-time">⏱ {formatTime(gameResult.gameTime)}</div>
{/* >>>>>>> origin/rankingview */}
        </div>
    )

//       <main className="result-main">
//         <div className="result-content">
//           {/* 플레이어 1 */}
//           <section className="player-section">
//             <div className="player-final">
//               {gameResult.player1.isWinner && (
//                 <div className="winner-crown" aria-label="승자">
//                   👑
//                 </div>
//               )}
//               <div className="player-avatar">📷</div>
//               <h3 className="player-name">{gameResult.player1.name}</h3>
//               <div className="final-score">
//                 {gameResult.player1.score.toLocaleString()}
//               </div>
//               <div className="player-stats">
//                 <div className="stat-item">
//                   <span>단어:</span> {gameResult.player1.wordsFound}개
//                 </div>
//                 <div className="stat-item">
//                   <span>콤보:</span> {gameResult.player1.maxCombo}
//                 </div>
//                 <div className="stat-item">
//                   <span>정확도:</span> {gameResult.player1.accuracy}%
//                 </div>
//               </div>
//               {gameResult.player1.maxCombo >= 5 && (
//                 <div className="achievement-badges">🔥 HOT STREAK</div>
//               )}
//             </div>
//           </section>

//           {/* 게임 보드 섹션 */}
//           <section className="result-board-section">
//             <div className="board-title">Found Words</div>
//             <div className="enhanced-game-board">
//               <div className="result-grid">
//                 {resultGrid.map((row, i) => (
//                   <div key={i} className="grid-row">
//                     {row.map((cell, j) => (
//                       <div
//                         key={j}
//                         className={`grid-cell ${
//                           cell.letter !== "*" ? "letter" : "empty"
//                         } ${
//                           cell.foundBy !== "none"
//                             ? `found-by-${cell.foundBy}`
//                             : "unfound"
//                         }`}
//                       >
//                         {cell.letter !== "*" ? cell.letter : ""}
//                       </div>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>

//           {/* 플레이어 2 */}
//           <section className="player-section">
//             <div className="player-final">
//               {gameResult.player2.isWinner && (
//                 <div className="winner-crown" aria-label="승자">
//                   👑
//                 </div>
//               )}
//               <div className="player-avatar">📷</div>
//               <h3 className="player-name">{gameResult.player2.name}</h3>
//               <div className="final-score">
//                 {gameResult.player2.score.toLocaleString()}
//               </div>
//               <div className="player-stats">
//                 <div className="stat-item">
//                   <span>단어:</span> {gameResult.player2.wordsFound}개
//                 </div>
//                 <div className="stat-item">
//                   <span>콤보:</span> {gameResult.player2.maxCombo}
//                 </div>
//                 <div className="stat-item">
//                   <span>정확도:</span> {gameResult.player2.accuracy}%
//                 </div>
//               </div>
//               {gameResult.player2.maxCombo >= 5 && (
//                 <div className="achievement-badges">🔥 HOT STREAK</div>
//               )}
//             </div>
//           </section>
//         </div>

//         {/* 액션 버튼들 */}
//         <section className="result-actions">
//           <button
//             className="btn-secondary"
//             onClick={() => navigate("/ranking")}
//           >
//             View Ranking
//           </button>
//           <button className="btn-secondary" onClick={() => navigate("/start")}>
//             Restart
//           </button>
//           <button className="btn-secondary" onClick={() => navigate("/start")}>
//             Next Round
//           </button>
//         </section>
//       </main>
//     </div>
//   );
}
