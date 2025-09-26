// views/GameView.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";
import CustomKeyboard from "../components/CustomKeyboard";
import ComboEffect from "../components/effects/ComboEffect";
import BalloonEffect from "../components/effects/BalloonEffect";
import ComboTextEffect from "../components/effects/ComboTextEffect";
import SoundManager from "../models/SoundManager";
import { Difficulty, PlaceWordLength } from "../models/GameConfiguration";
import HiddenWordBonusEffect from "../components/effects/HiddenWordBonusEffect";

//출력을 위한 난이도 분류
const DifficultyNames = {
    [Difficulty.VERYEASY]: "Very Easy",
    [Difficulty.EASY]: "Easy",
    [Difficulty.NORMAL]: "Normal",
    [Difficulty.HARD]: "Hard",
    [Difficulty.VERYHARD]: "Very Hard"
};

export default function GameView() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  const { controller, state,submitInput } = useGameController();
  const { player1, player2 } = state || {};

  const [showConfirm, setShowConfirm] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showHiddenWordBonus, setShowHiddenWordBonus] = useState(false); // 히든 워드 보너스 효과 상태
  
  const formatTime = (seconds = 0) => {
    const s = Number.isFinite(seconds) ? seconds : 0;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const getGameObjectives = () => {
        if (!controller || controller.currentGameDifficulty === undefined) {
            return { wordLength: 4, totalWords: "2-5", difficultyName: "Easy" };
        }
        
        const difficulty = controller.currentGameDifficulty;
        const wordLength = PlaceWordLength[difficulty] || 4;
        
        // Get actual placed words count from GameBoard
        let totalWords = "2-5"; // Default range
        
        // Use the new getPlacedWordsCount function from GameBoard
        if (controller.board && typeof controller.board.getPlacedWordsCount === 'function') {
            totalWords = controller.board.getPlacedWordsCount().toString();
        }
        // Fallback to other possible sources
        else if (controller.placedWordsCount !== undefined) {
            totalWords = controller.placedWordsCount.toString();
        } else if (controller.board?.placedWords?.length) {
            totalWords = controller.board.placedWords.length.toString();
        } else if (controller.placedWords?.length) {
            totalWords = controller.placedWords.length.toString();
        } else if (state.placedWords?.length) {
            totalWords = state.placedWords.length.toString();
        }
        
        const difficultyName = DifficultyNames[difficulty] || "Easy";
        
        return { wordLength, totalWords, difficultyName };
    };

  // BGM
  useEffect(() => {
    SoundManager.playBgm("gameBgm");
    return () => SoundManager.stopBgm();
  }, []);

  // 🔹 보드만 초기화 (플레이어 객체/사진은 유지!)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted || !controller) return;

      // 이미 시작되어 있고 다음 라운드가 아니면 중복 초기화 금지
      if (controller.gameStarted && !location.state?.nextRound) return;

      if (location.state?.nextRound) {  // 기존 점수 유지하면서 게임 재시작
        await controller.restartGame({
          difficulty: location.state.difficulty ?? state?.difficulty ?? 0,
          // 플레이어는 controller의 state를 그대로 사용하므로 별도 setPlayerInfo 호출 X
        });
      } else {
        await controller.startInitialGame(); // ← 여기서도 플레이어 재생성/초기화하지 않도록 컨트롤러 구현이 중요
      }

      // 중복 실행 방지
      navigate(location.pathname, { replace: true, state: {} });
    })();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, location.key]);

  // 턴 시작 시 입력 포커스
  useEffect(() => {
    if (state?.turnActive && inputRef.current) inputRef.current.focus();
  }, [state?.turnActive]);

  // 게임 종료 → 결과 화면
  useEffect(() => {
    if (!state?.gameOver) return;
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
  }, [state?.gameOver, navigate]);

  const handleSubmit = (e) => {
      e.preventDefault();

      if (!state.turnActive || state.turnTime <= 0) {
        console.log("⏰ 시간 초과! 입력 무시됨");
        return;
      }

      const currentPlayer = state.currentTurn;

      let isHidden = false;

      // 히든 워드 체크
      if (controller.board.isHiddenWord(state.inputValue)) {
        setShowHiddenWordBonus(true);
        isHidden = true; // 플래그 세팅
      }

      // 기본 정답 처리 (콤보 적용)
      controller.submitInput(state.inputValue);

      // 보너스 점수는 별도로 +1000
      if (isHidden) {
        const prevScore = controller[currentPlayer].getScore();
        controller[currentPlayer].setScore(prevScore + 1000);
        controller.setState({
          ...controller.state,
          [currentPlayer]: controller[currentPlayer].getData(),
        });
      }
};
    // 히든 워드 보너스 효과 완료 시 호출되는 함수
    const handleHiddenWordBonusComplete = useCallback(() => {
        setShowHiddenWordBonus(false);
    }, []);

  const handleQuitToResult = () => {
    SoundManager.play("clickPop");
    navigate("/result", {
  state: {
    player1: JSON.parse(JSON.stringify(state?.player1 ?? {})),
    player2: JSON.parse(JSON.stringify(state?.player2 ?? {})),
    gameTime: state?.timeIncreased,
    grid: state?.grid,
    highlight: controller?.board?.highlight
      ? JSON.parse(JSON.stringify(controller.board.highlight))
      : null,
    placedWordCheck: controller?.board?.placedWordCheck
      ? JSON.parse(JSON.stringify(controller.board.placedWordCheck))
      : null,
    difficulty: controller?.currentGameDifficulty,
  },
});
  };

  const handleQuit = () => {
    controller?.unmount?.();
    navigate("/start", { replace: true });
  };

  // 안전 아바타: photoPath가 있으면 image, 아니면 "👤"
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

  const objectives = getGameObjectives();

  return (
    <div className="game-view">
      <header className="game-header">
                <div className="header-left">
                    <div className="game-title">VOCARUSH</div>
                </div>
                <div className="header-center">
                  <div className="game-timer">
                    <div className="timer-text">
                      {formatTime(state.timeIncreased)}
                    </div>
                    <div className="game-objectives">
                      <div className="objective-item">
                        Words: <span className="objective-value">{objectives.totalWords}</span>
                      </div>
                      <div className="objective-item">
                        Length: <span className="objective-value">{objectives.wordLength}</span>
                      </div>
                      <div className="objective-item">
                        Level: <span className="objective-value">{objectives.difficultyName}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="header-right">
                    <button type="button" className="btn-small" onClick={handleQuitToResult}>
                    Quit
                    </button>
                </div>
            </header>

      <main className="game-main">
        {/* Player 1 */}
        <div className="player-info">
          <div className="avatar-large player1-avatar">
            <Avatar photoPath={player1?.photoPath} alt="player1" className="avatar-img" />
          </div>

          <div className="player-card player1-card">
            <h3>{player1?.name || "Player 1"}</h3>
            <div className="stat"><span>Score:</span> {player1?.score ?? 0}</div>
            <div className="stat"><span>Combo:</span> {player1?.combo ?? 0}</div>
            <div className="stat">
              <span>HP:</span>
              <div className="hp-bar">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`hp-heart ${i < (player1?.hp ?? 0) ? "active" : ""}`}
                  >
                    ♥
                  </div>
                ))}
              </div>
            </div>
            <button
              className={`turn-btn ${
                state?.currentTurn === "player1" && state?.turnActive ? "active" : ""
              }`}
              onClick={() => {
                SoundManager.play("clickTurn");
                controller?.startTurn?.(0);
              }}
              disabled={!!state?.turnActive || (player1?.hp ?? 0) <= 0}
            >
              My Turn
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="game-board">
          <div className="word-grid">
            {(state?.grid ?? []).map((row, i) => (
              <div key={i} className="grid-row">
                {row.map((cell, j) => {
                  let cellClass = "grid-cell";
                  cellClass += cell !== "*" ? " letter" : " empty";

                  const h = state?.highlight?.[i]?.[j];
                  if (h === "wrong") cellClass += " wrong-word";
                  else if (h === 0) cellClass += " found-by-player1";
                  else if (h === 1) cellClass += " found-by-player2";

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
          <div className="avatar-large player2-avatar">
            <Avatar photoPath={player2?.photoPath} alt="player2" className="avatar-img" />
          </div>

          <div className="player-card player2-card">
            <h3>{player2?.name || "Player 2"}</h3>
            <div className="stat"><span>Score:</span> {player2?.score ?? 0}</div>
            <div className="stat"><span>Combo:</span> {player2?.combo ?? 0}</div>
            <div className="stat">
              <span>HP:</span>
              <div className="hp-bar">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`hp-heart ${i < (player2?.hp ?? 0) ? "active" : ""}`}
                  >
                    ♥
                  </div>
                ))}
              </div>
            </div>
            <button
              className={`turn-btn ${
                state?.currentTurn === "player2" && state?.turnActive ? "active" : ""
              }`}
              onClick={() => {
                SoundManager.play("clickTurn");
                controller?.startTurn?.(1);
              }}
              disabled={!!state?.turnActive || (player2?.hp ?? 0) <= 0}
            >
              My Turn
            </button>
          </div>
        </div>
      </main>

      {/* Input + 턴 타이머 */}
      <footer className="game-input">
        {state?.turnActive && (
          <div className="turn-timer">
            <div
              className="turn-timer-fill"
              style={{ width: `${((state?.turnTime ?? 0) / 10) * 100}%` }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-container">
            <span className="input-label">Input &gt;&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={state?.inputValue ?? ""}
              onChange={(e) => controller?.setInputValue?.(e.target.value)}
              onFocus={() => setFocusedInput("game")}
              disabled={!state?.turnActive}
              className="word-input"
              placeholder="Type your word..."
            />
            <button type="submit" className="btn btn-primary submit-btn">
              SUBMIT
            </button>
          </div>
        </form>

        {/* 이펙트 */}
        {(player1?.combo ?? 0) >= 2 && <ComboEffect combo={player1.combo} />}
        {(player1?.combo ?? 0) >= 4 && <BalloonEffect combo={player1.combo} />}
        {(player2?.combo ?? 0) >= 2 && <ComboEffect combo={player2.combo} />}
        {(player2?.combo ?? 0) >= 4 && <BalloonEffect combo={player2.combo} />}

        {/* 가상 키보드 */}
        <CustomKeyboard
          viewType="game"
          focusedInput={focusedInput}
          setGameText={(val) => controller?.setInputValue?.(val)}
          gameValue={state?.inputValue ?? ""}
          onEnter={() => controller?.submitInput?.(state?.inputValue ?? "")}
        />
      </footer>

      {/* 콤보 텍스트 */}
      <ComboTextEffect combo={player1?.combo ?? 0} player="player1" />
      <ComboTextEffect combo={player2?.combo ?? 0} player="player2" />

      {/* 히든 워드 보너스 효과 */}
      <HiddenWordBonusEffect 
        show={showHiddenWordBonus} 
        onComplete={handleHiddenWordBonusComplete} 
      />

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
