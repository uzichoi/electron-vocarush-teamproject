import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";
import SoundManager from "../models/SoundManager";

export default function StartView() {
  const navigate = useNavigate();
  const { startNewGame } = useGameController();
    
useEffect(() => {
  SoundManager.playBgm("startBgm"); // 마운트 시 BGM 재생

  return () => {
    SoundManager.stopBgm(); // 언마운트 시 정지
  };
}, []);

    const handleStart = () => {
    //startNewGame();        // 새 GameController 생성
    SoundManager.play("clickPop");   // ✅ 효과음 재생
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

          <button className="btn" onClick={() => {navigate('/manual'); SoundManager.play("clickPop") ;} }>Manual</button>
          <button className="btn btn-danger" onClick={() => {SoundManager.play("clickPop"); window.close();}}>Exit</button>

        </div>
      </div>
    </div>
  );
}