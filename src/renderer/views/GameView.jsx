
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";

//export default function GameView({controller, state}) {
export default function GameView() {

    const navigate = useNavigate(); 
    const location = useLocation();   // 현재 위치 정보 가져오기
    const { controller, state, submitInput } = useGameController(); // 훅으로 컨트롤러와 state 접근
    const inputRef = useRef(null);
    const { player1, player2 } = location.state || {}; // PlayerConfigurationView.jsx에서 전달받은 데이터 추출. 데이터 없으면 {} 공백으로 대체

    const [showConfirm, setShowConfirm] = useState(false); // 확인창 상태
    const [isClosing, setIsClosing] = useState(false);     // 애니메이션 상태

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

  useEffect(() => { 
    if (!player1 || !player2) return;   // 데이터가 없으면 실행 X

    // Next Round인 경우, 기존 점수 유지하면서 게임 재시작
    if (location.state?.nextRound) {    
      controller.restartGame({      
        difficulty: location.state.difficulty,
        player1: location.state.player1,
        player2: location.state.player2,
      });
      // 중복 실행 방지. 현재 페이지의 경로('/game')이라면, 같은 페이지에 머무르면서 상태 변경
      navigate(location.pathname, { replace: true, state: {} });  // 현재 히스토리 덮어쓰면서, location.state를 빈 객체로 초기화
    } 
    else {
      // 처음 게임 시작하는 경우, 데이터를 컨트롤러에 저장.
      controller.setPlayerInfo("player1", player1.name, player1.photo);
      controller.setPlayerInfo("player2", player2.name, player2.photo);
      controller.startInitialGame();
    }
  }, [controller, player1, player2, location]);   // 의존성 배열. 배열 원소 중 하나라도 변경되면 useEffect 안의 코드가 다시 실행된다.

  // 게임 오버 시 결과 화면으로 이동
  useEffect(() => {
    if (state.gameOver) {
      setTimeout(() => {
      navigate("/result", {
        state: {
          player1: state.player1,
          player2: state.player2,
          gameTime: state.timeIncreased,
          grid: state.grid,
          highlight: state.highlight,
          placedWordCheck: state.placedWordCheck,
          difficulty: state.difficulty,
        },
      });
    },0);
  }
  }, [state.gameOver, navigate]);

    useEffect(() => {
    if (state.turnActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.turnActive]);

        // useEffect(() => {
        //     let mounted = true;

        //     async function startGame() {
        //         if (!mounted) return;

        //         if (location.state?.nextRound) {
        //             await controller.restartGame({difficulty: location.state.difficulty });
        //         // 🔹 location.state 초기화 → 중복 실행 방지
        //     navigate(location.pathname, { replace: true, state: {} });
        //           } else {
        //             await controller.startInitialGame();
        //         }
        //     }

        //     startGame();

        //     return () => { mounted = false; };
        // }, [controller, location.state, location.pathname]); // location.key가 바뀌면 useEffect 재실행


    const handleSubmit = (e) => {
        e.preventDefault();
        controller.submitInput(state.inputValue);
    };
    
    const handleQuitToResult = () => { // 진행된 보드 상태를 ResultView로 전달
    navigate("/result", {
    state: {
        player1: state.player1,
        player2: state.player2,
        gameTime: state.timeIncreased,
        grid: state.grid,                    // 진행된 보드
        highlight: controller.board.highlight,          // 정답 하이라이트
        placedWordCheck: controller.board.placedWordCheck, // 배치된 단어들
        difficulty: controller.currentGameDifficulty // 현재 난이도 같이 전달
    },
  });
};
  
    const handleQuit = () => {
    controller.unmount(); // 게임 타이머, 이벤트 정리
    navigate("/start", { replace: true }); // 첫 화면으로 이동
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
                    <button className="btn-small" onClick={handleQuitToResult}>
                    Quit
                    </button>
                </div>
            </header>
        <main className="game-main">
        {/* Player 1 */}
        <div className="player-info">
          {/* 사진 박스 */}
          <div className="avatar-large player1-avatar">
            {state.player1.photo || "👤"}
          </div>

          {/* 정보 카드 */}
          <div className="player-card player1-card">
            <h3>{state.player1.name || "Player 1"}</h3>
            <div className="stat"><span>Score:</span> {state.player1.score}</div>
            <div className="stat"><span>Combo:</span> {state.player1.combo}</div>
            <div className="stat"><span>HP:</span>
              <div className="hp-bar">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`hp-heart ${i < state.player1.hp ? "active" : ""}`}>♥</div>
                ))}
              </div>
            </div>
            <button
              className={`turn-btn ${state.currentTurn === "player1" && state.turnActive ? "active" : ""}`}
              onClick={() => controller.startTurn("player1")}
              disabled={state.turnActive || state.player1.hp <= 0}
            >
              My Turn
            </button>
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
      {/* Player 2 */}
      <div className="player-info">
        {/* 사진 박스 */}
        <div className="avatar-large player2-avatar">
          {state.player2.photo || "👤"}
        </div>

        {/* 정보 카드 */}
        <div className="player-card player2-card">
          <h3>{state.player2.name || "Player 2"}</h3>
          <div className="stat"><span>Score:</span> {state.player2.score}</div>
          <div className="stat"><span>Combo:</span> {state.player2.combo}</div>
          <div className="stat"><span>HP:</span>
            <div className="hp-bar">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`hp-heart ${i < state.player2.hp ? "active" : ""}`}>♥</div>
              ))}
            </div>
          </div>
          <button
            className={`turn-btn ${state.currentTurn === "player2" && state.turnActive ? "active" : ""}`}
            onClick={() => controller.startTurn("player2")}
            disabled={state.turnActive || state.player2.hp <= 0}
          >
            My Turn
          </button>
        </div>
      </div>          
      </main>
      {/* Input + 턴 타이머 */}
      <footer className="game-input">
        {state.turnActive && (
          <div className="turn-timer">
            <div className="turn-timer-fill" style={{ width: `${(state.turnTime / 10) * 100}%` }} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <span className="input-label">Input &gt;&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={state.inputValue}
              onChange={(e) => controller.setInputValue(e.target.value)}
              disabled={!state.turnActive}
              className="word-input"
              placeholder="Type your word..."
            />
            <button type="submit" className="btn btn-primary submit-btn">SUBMIT</button>
          </div>
        </form>
      </footer>

      {/* Quit 확인 모달 */}
        {showConfirm && (
        <div className="confirm-overlay">
            <div className={`confirm-box ${isClosing ? "hide" : ""}`}>
            <p className="confirm-message">정말 종료하시겠습니까?</p>
            <div className="btn-row">
            <button className="btn-confirm ok" onClick={handleQuit}>확인</button>
            <button className="btn-confirm cancel" onClick={() => setShowConfirm(false)}>취소</button>
            </div>
            </div>
        </div>
        )}
    </div>
  );

}
