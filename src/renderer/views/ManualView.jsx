import React from "react";
import { useNavigate } from "react-router-dom";
import SoundManager from "../models/SoundManager";
export default function ManualView() {
  const navigate = useNavigate();

  return (
    <div className="manual-view"> 
      <div className="manual-title">How to Play</div>
      <div className="manual-content">
        <div className="description-board">
          <div className="description-row">
            <span>1. This is a 2-player word battle game.</span>
          </div>
          <div className="description-row">
            <span>2. The player who presses <b>My Turn</b> first gets the chance to answer.</span>
          </div>
          <div className="description-row">
            <span>3. Each turn has a <b>10-second</b> time limit.</span>
          </div>
          <div className="description-row">
            <span>4. Levels: Very Easy, Easy, Normal, Hard, Very Hard. Higher levels = longer words.</span>
          </div>
          <div className="description-row">
            <span>5. Consecutive correct answers give <b>combo multipliers</b>.</span>
          </div>
          <div className="description-row">
            <span>6. Find the Hidden Word on the board! Earn +1000 bonus points and a 🍬 Candy!</span>
          </div>
        </div>
       </div>
        <footer className="manual-footer">
            <button className="manual-btn-small" onClick={() =>{SoundManager.play("clickPop"); navigate('/start');}}>← Back</button>
        </footer>

      </div>
  );
}
