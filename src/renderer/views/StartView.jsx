import React from "react";
import { useNavigate } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";

export default function StartView() {
  const navigate = useNavigate();
  const { startNewGame } = useGameController();

    const handleStart = () => {
    //startNewGame();        // 새 GameController 생성
    navigate("/config");   // 설정 화면으로 이동
  };

  return (
    <div className="start-view">
      <div style={{ textAlign: "center" }}>
        <h5 className="start-subtitle">WELCOME TO</h5>
        <h1 className="start-title">VocaRush</h1>
        <button className="btn btn-primary" onClick={handleStart}>
            START
        </button>
        <div className="menu-row">
          <button className="btn" onClick={() => navigate('/manual')}>Manual</button>
          <button className="btn btn-danger" onClick={() => window.close()}>Exit</button>
        </div>
      </div>
    </div>
  );
}