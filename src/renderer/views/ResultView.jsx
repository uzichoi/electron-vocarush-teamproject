import React, { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { gameController } from "../controllers/GameController"; // ✅ 인스턴스 import
import { useGameController } from "../hooks/useGameController";
import SoundManager from "../models/SoundManager";
export default function ResultView() {
    const navigate = useNavigate();
    const { state, startNewGame } = useGameController(); // state 정의
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
    //SoundManager.play("tada");
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

  const [played, setPlayed] = useState(false); // ✅ 효과음이 이미 나왔는지 여부 저장


  useEffect(() => {
    SoundManager.playBgm("resultBgm"); // 마운트 시 BGM 재생
  
    return () => {
    // 👇 Ranking 페이지로 이동할 때는 끊지 않음
    // 👇 결과뷰에서 다른 곳으로 이동할 때만 정지
    if (location.pathname !== "/ranking") {
      //SoundManager.stopBgm();
    }
    };
  }, []);

    // ✅ 컴포넌트 마운트 시 0.5초 후 사운드 재생
useEffect(() => {
  if (!gameResult) return;

  // ✅ 뒤로 온 경우라면 소리 막기
  if (sessionStorage.getItem("fromBack") === "true") {
    sessionStorage.removeItem("fromBack"); // 플래그 제거
    return;
  }

  const timer = setTimeout(() => {
    SoundManager.play("tada");
  }, 500);



  return () => clearTimeout(timer);
}, [gameResult]);

const { grid, highlight, placedWordCheck } = gameResult;


// New Game 클릭 시 호출할 함수
const handleNewGame = () => {
    //startNewGame();      // 새 게임 컨트롤러 생성
    SoundManager.play("clickPop");

    // 상태 초기화
    const initialPlayer1 = {
        name: null,
        score: 0,
        hp: 5,
        photoPath: null,  
        combo: 0,
        maxCombo: 0,
    };

    const initialPlayer2 = {
        name: null,
        score: 0,
        hp: 5,
        photoPath: null,  
        combo: 0,
        maxCombo: 0,
    };

    navigate("/start", {
        state: {
            ...state,
            difficulty: 0,
            player1: initialPlayer1,
            player2: initialPlayer2,
        },
        replace: false, 
        key: Date.now()  // 강제로 location.key 변경
    });  
};


// Next Round 클릭 시 호출할 함수
const handleNextRound = () => {
    // 임시 경로를 거쳐서 강제로 GameView 재마운트
    // navigate("/start"); 
    // 현재 난이도에 +1 해서 GameView로 전달
    SoundManager.play("clickPop");
    const nextDifficulty = (gameResult.difficulty ?? 0) + 1;

    setTimeout(() => {
        navigate("/game", { 
            state: { nextRound: true,
                        difficulty: nextDifficulty, // 현재 난이도 같이 전달
                        player1: gameResult.player1,
                        player2: gameResult.player2,
            },
            replace: false,
            key: Date.now()  // 강제로 location.key 변경
        });
    }, 0);
};

  useEffect(() => {
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

  const Avatar = ({ photoPath, alt, className }) =>
    photoPath ? (
      <img
        key={photoPath}
        src={photoPath}
        alt={alt}
        className={className}
        //onError={(e) => {
          ///const [base] = (photoPath || "").split("?");
          //e.currentTarget.src = `${base}?t=${Date.now()}`;
        //}}
      />
    ) : (
      "👤"
  );

    return (
        <div className="result-view">
            <header className="result-header">
                {/* <div className="header-left">
                    <button className="btn-small" onClick={() => {navigate('/game')}}>← BACK</button>
                </div> */}
                <div className="header-center">
                    <h1 className="result-title">GAME RESULT</h1>
                    {/*  게임 시간 표시 */}
                    <div className="final-time">⏱ {formatTime(gameResult.gameTime)}</div>
                </div>
                
            </header>

            <main className="result-main">
                <div className="result-content">
                    {/* 플레이어 1 */}
                    <section className="player-section">
                        <div className={`player-final ${gameResult.player1.isWinner ? 'winner' : ''} player1-final`}>
                            {gameResult.player1.isWinner && (
                                <div className="winner-crown" aria-label="승자">👑</div>
                            )}
                            <div className="avatar-large player-avatar">
                                <Avatar photoPath={gameResult.player1.photoPath} alt="player1" className="avatar-img" />
                            </div>
                            <h3 className="player-name">{gameResult.player1.name}</h3>
                            <div className={`final-score ${gameResult.player1.isWinner ? 'winner' : ''}`}>
                                {gameResult.player1.score.toLocaleString()}
                            </div>
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
                    <div
                        className="result-board"
                        style={{
                        gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`, // 가로 칸수 자동
                        }}
                    >
                        {grid.map((row, i) =>
                        row.map((cell, j) => {
                            let cellClass = "grid-cell";
                            cellClass += cell !== "*" ? " letter" : " empty";

                            const player = highlight?.[i]?.[j];
                            if (player === 0) cellClass += " found-by-player1";
                            else if (player === 1) cellClass += " found-by-player2";
                            else if (player === -1 && placedWordCheck?.[i]?.[j])
                            cellClass += " unfound-by-players";

                            return (
                            <div key={`${i}-${j}`} className={cellClass}>
                                {cell}
                            </div>
                            );
                        })
                        )}
                    </div>
                    </section>
                         
                     
                    {/* 게임 통계를 게임 보드 하단에 배치 */}
                    {/*
                        <div className="match-stats">
                            <div className="stat-row">게임 시간: {gameResult.gameTime}</div>
                            <div className="stat-row">전체 단어: {gameResult.totalWords}개</div>
                            <div className="stat-row">발견 단어: {gameResult.foundWords}개</div>
                        </div> */}
        

                    {/* 플레이어 2 */}
                    <section className="player-section">
                        <div className={`player-final ${gameResult.player2.isWinner ? 'winner' : ''} player2-final`}>
                            {gameResult.player2.isWinner && (
                                <div className="winner-crown" aria-label="winner">👑</div>
                            )}
                            <div className="avatar-large player-avatar">
                                <Avatar photoPath={gameResult.player2.photoPath} alt="player2" className="avatar-img" />
                            </div>
                            <h3 className="player-name">{gameResult.player2.name}</h3>
                            <div className={`final-score ${gameResult.player2.isWinner ? 'winner' : ''}`}>
                                {gameResult.player2.score.toLocaleString()}
                            </div>
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
                    <button className="btn-secondary" onClick={() => {SoundManager.play("clickPop"); navigate("/ranking");}}>
                        View Ranking
                    </button>
                    <button className="btn-secondary" onClick={handleNewGame}>
                        New Game
                    </button>
                    <button className="btn-secondary" onClick={handleNextRound}>
                        Next Round
                    </button>
                </section>
            </main>

        </div>
    )
}
