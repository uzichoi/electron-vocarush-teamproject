import React from "react";
import { useNavigate } from "react-router-dom";

export default function ManualView() {
  const navigate = useNavigate();

  return (
    <div className="manual-view"> 
        <div className="manual-title">How to Play</div>
        <div className="manual-content">
            <div className="description-board">
                <div className="description-row">
                    <span>1.  2인 배틀형 단어 찾기 게임입니다.</span>
                </div>
                <div className="description-row">
                    <span>2.  버튼을 먼저 누른 사람이 입력 기회를 가집니다.</span>
                </div>
                <div className="description-row">
                    <span>3.  입력 제한 시간은 5초입니다.</span>
                </div>
                <div className="description-row">
                    <span>4.  EASY, NORMAL, HARD 세 단계로 구성되며, 난이도에 따라 정답 단어의 길이와 배점이 다릅니다.</span>
                </div>
                <div className="description-row">
                    <span>5.  연속 정답 시 콤보 배수가 적용됩니다.</span>
                </div>
            </div>
        </div>
        <footer className="manual-footer">
            <button className="manual-btn-small" onClick={() => navigate('/start')}>← Back</button>
        </footer>
    </div>
  );
}