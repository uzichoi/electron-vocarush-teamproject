// views/PlayerConfigurationView.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";
import CustomKeyboard from "../components/CustomKeyboard";
import SoundManager from "../models/SoundManager";

export default function PlayerConfigurationView() {
  // UI-only states (keep original intent)
  const [countdown, setCountdown] = useState(null);
  const [countTarget, setCountTarget] = useState(null); // 0 or 1
  const [focusedInput, setFocusedInput] = useState(null); // "p1" | "p2" | null

  const navigate = useNavigate();
  const { state, controller } = useGameController(); // subscribe latest controller/state
  const { player1, player2 } = state || {};

  useEffect(() => {
    // Mount/Unmount side effects: stop BGM on unmount (kept from original)
    return () => {
      SoundManager.stopBgm();
    };
  }, []);

  if (!controller) return <div>Error: Controller not found</div>;

  // ---- Handlers ----
  // Keep feature branch behavior: write directly into controller state
  const onChangeName = (idx, eOrText) => {
    const value = typeof eOrText === "string" ? eOrText : eOrText?.target?.value;
    controller.setPlayerName?.(idx, value ?? "");
  };

  // Merge: show simple 3-2-1 countdown (from HEAD) + IPC capture (from feature)
  const handleCapture = async (idx) => {
    const currentPlayer = idx === 0 ? player1 : player2;
    const name = currentPlayer?.name || "";

    if (!name) {
      alert("먼저 플레이어 이름을 입력해주세요.");
      return;
    }

    // Countdown visual + sounds (non-blocking UI)
    let count = 3;
    setCountTarget(idx);
    setCountdown(count);
    SoundManager.play("clickTurn");

    await new Promise((resolve) => {
      const timer = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(timer);
          setCountdown(null);
          setCountTarget(null);
          SoundManager.play("kamera");
          resolve();
        }
      }, 1000);
    });

    // IPC call to Python to capture and return file URL
    let result;
    try {
      result = await window.electronAPI.captureFace(name);
    } catch (e) {
      console.error("IPC invoke error:", e);
      return;
    }

    const { code, fileUrl, stdout, stderr } = result || {};
    console.log("[PY DONE]", { code, stdout, stderr, fileUrl });

    if (code !== 0 || !fileUrl) {
      console.warn("capture failed\n", stderr || stdout || `exit code: ${code}`);
      return;
    }

    try {
      controller.setPlayerPhoto?.(idx, fileUrl);
    } catch (e) {
      console.error("setPlayerPhoto error: ", e);
    }
  };

  // Start game: GameView will pull controller/state via hook
  const handleStartGame = () => {
    SoundManager.play("clickGameStart");
    navigate("/game");
  };

  // ---- Render ----
  return (
    <div className="config-view">
      {/* 중앙 카운트다운 (kept from original) */}
      {countdown !== null && (
        <div
          className="global-countdown"
          style={{
            color: countTarget === 0 ? "#42a5f5" : "#ffb3d1",
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
            value={player1?.name ?? ""}
            onFocus={() => {
              setFocusedInput("p1");
              SoundManager.play("clickTurn");
            }}
            onChange={(e) => onChangeName(0, e)}
          />
          <div className="photo-box">
            {player1?.photoPath ? (
              <img
                key={player1.photoPath}
                src={player1.photoPath}
                alt="player1"
                onError={(e) => {
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
            placeholder="이름 입력"
            value={player2?.name ?? ""}
            onFocus={() => {
              setFocusedInput("p2");
              SoundManager.play("clickTurn");
            }}
            onChange={(e) => onChangeName(1, e)}
          />
          <div className="photo-box">
            {player2?.photoPath ? (
              <img
                key={player2.photoPath}
                src={player2.photoPath}
                alt="player2"
                onError={(e) => {
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
          disabled={!player1?.name || !player2?.name}
        >
          Game Start
        </button>

        {/* 가상 키보드: 원래 props 유지하되 controller에 직접 반영되도록 어댑터 전달 */}
        <CustomKeyboard
          viewType="config"
          focusedInput={focusedInput}
          setPlayer1={(txt) => onChangeName(0, txt)}
          setPlayer2={(txt) => onChangeName(1, txt)}
        />
      </div>
    </div>
  );
}
