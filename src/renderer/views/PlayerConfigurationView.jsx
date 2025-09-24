import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";
import SoundManager from "../models/SoundManager";

export default function PlayerConfigurationView() {
  const navigate = useNavigate();
  const location = useLocation();

  // 플레이어 네임을 초기화 상태로 설정
  const [nameP1, setNameP1] = useState("");
  const [nameP2, setNameP2] = useState("");
  const [photoP1, setPhotoP1] = useState(null);
  const [photoP2, setPhotoP2] = useState(null);
  const [capBusy, setCapBusy] = useState([false, false]);

  // 포커스 추적
  const [focusedInput, setFocusedInput] = useState(null);

  // 새로고침 시 초기화 (컴포넌트가 처음 렌더링될 때마다)
  useEffect(() => {
    setNameP1("");
    setNameP2("");
    setPhotoP1(null);
    setPhotoP2(null);
  }, []); // 빈 배열로 설정하면 최초 렌더링 시에만 호출

  const { state, controller } = useGameController();
  const { player1, player2 } = state || {};

  const writeNameToController = (idx, value) => {
    controller.setPlayerName?.(idx, value ?? "");
  };

  // file:// 스킴 보장
  const toFileURL = (p) => {
    if (!p) return "";
    const hasScheme = /^([a-z]+):\/\//i.test(p);
    if (hasScheme) return p;
    const normalized = p.replace(/\\/g, "/");
    return `file:///${normalized.replace(/^\/+/, "")}`;
  };

  // 사진 캡처 및 저장
  const handleCapture = async (idx) => {
    if (capBusy[idx]) return; // 이미 캡처 중이면 무시

    const name = idx === 0 ? nameP1 : nameP2; // 로컬 이름 신뢰
    if (!name) {
      alert("먼저 플레이어 이름을 입력해주세요.");
      return;
    }

    // 캡처 락 설정
    setCapBusy((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });

    try {
      // 카메라 사운드
      SoundManager.play("kamera");

      if (!window?.electronAPI?.captureFace) {
        console.error("electronAPI.captureFace not available (check preload expose)");
        return;
      }

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
        const fileSrc = toFileURL(fileUrl);
        controller.setPlayerPhoto?.(idx, fileSrc); // 내부에서 photoPath로 저장되도록
      } catch (e) {
        console.error("setPlayerPhoto error:", e);
      }
    } finally {
      // 락 해제
      setCapBusy((prev) => {
        const next = [...prev];
        next[idx] = false;
        return next;
      });
    }
  };

  const handleStartGame = () => {
    SoundManager.play("clickGameStart");
    navigate("/game");
  };

  return (
    <div className="config-view">
      <div className="config-players">
        {/* Player 1 */}
        <div className="player-config player1-config">
          <h2>Player 1</h2>
          <input
            type="text"
            placeholder="이름 입력"
            value={nameP1}
            onFocus={() => {
              setFocusedInput("p1");
              SoundManager.play("clickTurn");
            }}
            onChange={(e) => {
              const v = e.target.value;
              setNameP1(v); // 로컬 상태 업데이트
              writeNameToController(0, v); // 컨트롤러에도 반영
            }}
          />
          <div className="photo-box">
            {photoP1 ? (
              <img
                key={photoP1}
                src={photoP1}
                alt="player1"
                onError={(e) => {
                  const [base] = (photoP1 || "").split("?");
                  e.currentTarget.src = `${base}?t=${Date.now()}`;
                  console.warn("Image reload attempted:", e);
                }}
              />
            ) : (
              "👤"
            )}
          </div>
          <button
            className="btn-capture"
            onClick={() => handleCapture(0)}
            disabled={capBusy[0]} // 캡처 중에는 비활성화
          >
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
            value={nameP2}
            onFocus={() => {
              setFocusedInput("p2");
              SoundManager.play("clickTurn");
            }}
            onChange={(e) => {
              const v = e.target.value;
              setNameP2(v); // 로컬 상태 업데이트
              writeNameToController(1, v); // 컨트롤러에도 반영
            }}
          />
          <div className="photo-box">
            {photoP2 ? (
              <img
                key={photoP2}
                src={photoP2}
                alt="player2"
                onError={(e) => {
                  const [base] = (photoP2 || "").split("?");
                  e.currentTarget.src = `${base}?t=${Date.now()}`;
                  console.warn("Image reload attempted:", e);
                }}
              />
            ) : (
              "👤"
            )}
          </div>
          <button
            className="btn-capture"
            onClick={() => handleCapture(1)}
            disabled={capBusy[1]} // 캡처 중에는 비활성화
          >
            Capture
          </button>
        </div>
      </div>

      <div className="start-container">
        <button
          className="start-btn"
          onClick={() => navigate("/game")}
          disabled={!nameP1.trim() || !nameP2.trim()}
        >
          Game Start
        </button>
      </div>
    </div>
  );
}
