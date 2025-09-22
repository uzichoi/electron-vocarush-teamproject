// views/PlayerConfigurationView.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";

export default function PlayerConfigurationView() {
  const navigate = useNavigate();
  const { state, controller } = useGameController(); // 훅에서 최신 컨트롤러 가져오기. 실시간 상태 구독
  const { player1, player2 } = state;

  // const [countdown, setCountdown] = useState(null);
  // const [countTarget, setCountTarget] = useState(null);

  // 이름 입력 시, 컨트롤러에 즉시 반영
  const onChangeName = (idx, e) => {
    controller.setPlayerName?.(idx, e.target.value);
  };
  
  // 얼굴 촬영, IPC로 파이썬 호출해 파일 저장 + 경로 반환
  const handleCapture = async(idx) => {
    const currentPlayer = (idx === 0) ? player1 : player2;   
    const name = currentPlayer.name;  

    if (!name) { alert("먼저 플레이어 이름을 입력해주세요."); return; }
    
    // UI 카운트다운
    let count = 3;
    //setCountTarget(idx);
    //setCountdown(count); 

    /*const timer = setInterval(() => {
      count -= 1;
      if (count > 0) setCountdown(count); 
      else {
        clearInterval(timer);
        setCountdown(null);
        setCountTarget(null);
      }
    }, 1000);*/

    let result;
    try {
      result = await window.electronAPI.captureFace(name);
    } catch (e) {
      console.error("IPC invoke error:", e);
      return;
    }

    const { code, fileUrl, stdout, stderr } = result; // 여기까지 왔으면 invoke 자체는 성공 (항상 resolve하는 형태로 바꿨기 때문)
    console.log("[PY DONE]", { code, stdout, stderr, fileUrl });

    if (code !== 0 || !fileUrl) {
      console.warn("capture failed\n", stderr || stdout || `exit code: ${code}`);
      return;
    }

    try {   
      controller.setPlayerPhoto?.(idx, fileUrl); // 사진 교체 최종 트리거
    } catch (e) {
      console.error("setPlayerPhoto error: ", e);
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
      <div className="config-players">
        {/* Player 1 */}
        <div className="player-config player1-config">
          <h2>Player 1</h2>
          <input
            type="text"
            placeholder="Input your name"
            onChange={(e) => onChangeName(0, e)}
          />
          <div className="photo-box">
            {player1.photoPath ? (
              <img  // src 바뀔 때 강제 리렌더
                key={player1.photoPath}    
                src={player1.photoPath}
                alt="player1"
                onError={(e) => {
                  // 드물게 파일을 잠깐 못 읽어들이는 경우 한 번 더 버스팅해서 재시도
                  const [base] = player1.photoPath.split("?"); 
                  e.currentTarget.src = `${base}?t=${Date.now()}`;
                  console.warn("Image reload attempted: ", e);
                }}
              />
            ) : (
              "👤"
            )}
          </div>
          <button className="btn-capture" onClick={() => handleCapture(0)}>
            Capture
          </button>
        </div>

        {/* VS */}
        <div className="vs-text">VS</div>

        {/* Player 2 */}
        <div className="player-config player2-config">
          <h2>Player 2</h2>
          <input
            type="text"
            placeholder="Input your name"
            onChange={(e) => onChangeName(1, e)}
          />
          <div className="photo-box">
            {player2.photoPath ? (
              <img  // src 바뀔 때 강제 리렌더
                key={player2.photoPath}    
                src={player2.photoPath}
                alt="player2"
                onError={(e) => {
                  // 드물게 파일을 잠깐 못 읽어들이는 경우 한 번 더 버스팅해서 재시도
                  const [base] = player2.photoPath.split("?"); 
                  e.currentTarget.src = `${base}?t=${Date.now()}`;
                  console.warn("Image reload attempted: ", e);
                }}
              />
            ) : (
              "👤"
            )}
          </div>
          <button className="btn-capture" onClick={() => handleCapture(1)}>
            Capture
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
