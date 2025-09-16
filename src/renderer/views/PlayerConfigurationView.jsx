import React, { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";

//import { useNavigate } from "react-router-dom";
import CustomKeyboard from "../components/Customkeyboard";

export default function PlayerConfigurationView() {
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [player1Photo, setPlayer1Photo] = useState("📷");
  const [player2Photo, setPlayer2Photo] = useState("📷");
  const [countdown, setCountdown] = useState(null);
  const [countTarget, setCountTarget] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const navigate = useNavigate();
  const { controller } = useGameController(); // 🔹 훅에서 최신 컨트롤러 가져오기

    if (!controller) return <div>Error: Controller not found</div>;
  // 사진 촬영 카운트다운
  const handleCapture = (player) => {
    let count = 3;
    setCountTarget(player);
    setCountdown(count);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count); // 3,2,1 다 보이게 함
      } else {
        clearInterval(timer);
        setCountdown(null);
        setCountTarget(null);

        // 사진 대신 이모지 사용
        if (player === 1) setPlayer1Photo("👤");
        else setPlayer2Photo("👤");
      }
    }, 1000);
  };

  // 게임 시작
  // const handleStartGame = () => {
  //   if (!controller) return;
  //   controller.setPlayerInfo("player1", player1Name, player1Photo);
  //   controller.setPlayerInfo("player2", player2Name, player2Photo);
  //   controller.startInitialGame(); // 🔹 게임 초기화
  //   navigate("/game",{ state: { fromConfig: true, key: Date.now() } }); // GameView 라우트로 이동
  // };

  const handleStartGame = () => {
    // 컨트롤러는 만들지 않고, 설정값만 전달
    navigate("/game", { 
      state: { 
        player1: { name: player1Name, photo: player1Photo },
        player2: { name: player2Name, photo: player2Photo }
      }
    });
  };

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
            value={player1Name}
            onFocus={() => setFocusedInput("p1")}
            onChange={(e) => setPlayer1Name(e.target.value)}
          />
          <div className="photo-box">{player1Photo}</div>
          <button className="btn-capture" onClick={() => handleCapture(1)}>
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
            value={player2Name}
            onFocus={() => setFocusedInput("p2")}
            onChange={(e) => setPlayer2Name(e.target.value)}
          />
          <div className="photo-box">{player2Photo}</div>
          <button className="btn-capture" onClick={() => handleCapture(2)}>
            사진 촬영
          </button>
        </div>
      </div>

      {/* Game Start */}
      <div className="start-container">
        <button
          className="start-btn"
          onClick={handleStartGame}
          disabled={!player1Name || !player2Name}
        >
          Game Start
        </button>

        {/*키보드 기분좋게 등장*/}
        {
        <CustomKeyboard
            viewType="config"
            focusedInput={focusedInput}
            setPlayer1={setPlayer1Name}
            setPlayer2={setPlayer2Name}
            //setGameText={setGameInput}
            //onEnter={handleStartGame}
        />
        }
      </div>
      
    </div>
  );
}
