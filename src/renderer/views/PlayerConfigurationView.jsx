import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";

export default function PlayerConfigurationView() {
  const navigate = useNavigate();
  const { state, controller } = useGameController(); // 훅에서 최신 컨트롤러 가져오기. 실시간 상태 구독
  const { player1, player2 } = state;

  const [countdown, setCountdown] = useState(null);
  const [countTarget, setCountTarget] = useState(null);

  // 이름 입력 시, 컨트롤러에 즉시 반영
  const onChangeName = (idx, e) => {
    controller.setPlayerName?.(idx, e.target.value);
  };
  
  // 얼굴 촬영, IPC로 파이썬 호출해 파일 저장 + 경로 반환
  const handleCapture = async(idx) => {
    const currentPlayer = (idx == 0) ? player1 : player2;   // 이름 미입력 시 alert
    const name = currentPlayer.name;  

    if(!name) {
      alert("먼저 플레이어 이름을 입력해주세요.");
      return;
    }

    // UI 카운트다운
    let count = 3;
    setCountTarget(idx);
    setCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count); // 3,2,1 다 보이게 함
      } else {
        clearInterval(timer);
        setCountdown(null);
        setCountTarget(null);

        controller.setPlayerPhoto?.(idx, "👤");   // fallback: 사진 대신 기본 아이콘
      }
    }, 1000);

    // 실제 사진 촬영
    try {
      const savePath = await window.electronAPI?.captureFace(name); // 저장된 이미지 파일의 경로

      if (savePath) {
        controller.setPlayer1Photo?.(idx, savePath);
      } else {
        alert("얼굴 캡처에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("얼굴 캡처 중 오류가 발생했습니다.");
    }
  };

  // 게임 시작. GameView로 이동
  const handleStartGame = () => { 
    navigate("/game");
  };

  if (!controller) {
    return <div>Error: Controller not found</div>   // 컨트롤러 객체 존재하지 않으면, 에러 메시지 반환
  }

  // 화면에 표시되는 내용
  return (
    <div className="config-view">
      {/* 중앙 카운트다운 */}
      {countdown !== null && (
        <div
          className="global-countdown"
          style={{
            color: countTarget === 1 ? "#ec4899" : "#10b981",
          }}
        >
          {countdown}
        </div>
      )}

      <div className="config-players">
        {/* Player 1 */}
        <div className="player-config player1-config">
          <h2>Player 1</h2>
          <input
            type="text"
            placeholder="이름 입력"
            value={player1.name}
            onChange={(e) => onChangeName(0, e)}
          />
          <div className="photo-box">
            <img src={`file://${player1.photoPath}`} alt="player1"></img>
          </div>
          <button className="btn-capture" onClick={() => handleCapture(0)}>
            사진 촬영
          </button>
        </div>

        {/* VS */}
        <div className="vs-text">VS</div>

        {/* Player 2 */}
        <div className="player-config player2-config">
          <h2>Player 2</h2>
          <input
            type="text"
            placeholder="이름 입력"
            value={player2.name}
            onChange={(e) => onChangeName(1, e)}
          />
          <div className="photo-box">
            <img src={`file://${player2.photoPath}`} alt="player2"></img>
          </div>
          <button className="btn-capture" onClick={() => handleCapture(1)}>
            사진 촬영
          </button>
        </div>
      </div>

      {/* Game Start */}
      <div className="start-container">
        <button
          className="start-btn"
          onClick={handleStartGame}
          disabled={!player1.name || !player2.name}
        >
          Game Start
        </button>
      </div>
    </div>
  );
}
