import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";
import SoundManager from "../models/SoundManager";

export default function StartView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { player1, player2, difficulty } = location.state || {};
  
  // const { startNewGame } = useGameController();
    
  useEffect(() => {
    SoundManager.playBgm("startBgm"); // 마운트 시 BGM 재생
    if (player1 && player2) {
      console.log(`${player1} vs ${player2} ready!`);
    }

    return () => {};  //SoundManager.stopBgm(); // 언마운트 시 정지
  }, []);

  const handleStart = () => {
    //startNewGame();        // 새 GameController 생성

    SoundManager.play("clickPop");   // 효과음 재생
    navigate("/config", { 
      state: { 
        player1Name: player1?.name || "",
        player2Name: player2?.name || "",
        difficulty,
        fromStart: true
      } 
    });
  };

  return (
    <div className="start-view">
      <div style={{ textAlign: "center" }}>
        <h5 className="start-subtitle">Welcome to</h5>
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