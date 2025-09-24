// views/PlayerConfigurationView.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";
import CustomKeyboard from "../components/CustomKeyboard";
import SoundManager from "../models/SoundManager";

export default function PlayerConfigurationView() {
  // UI-only states (countdown 제거)
  const [focusedInput, setFocusedInput] = useState(null); // "p1" | "p2" | null

  // 입력 로컬 미러(입력창은 로컬을 단일 소스로 유지)
  const [nameP1, setNameP1] = useState("");
  const [nameP2, setNameP2] = useState("");

  // 캡처 중복 방지 락 (per player)
  const [capBusy, setCapBusy] = useState([false, false]);

  const navigate = useNavigate();
  const { state, controller } = useGameController();
  const { player1, player2 } = state || {};

  // mount/unmount
  useEffect(() => {
    return () => {
      SoundManager.stopBgm();
    };
  }, []);

  if (!controller) return <div>Error: Controller not found</div>;

  // 안전 문자열/기본명 판별
  const safeTrim = (s) => {
    if (typeof s === "string") return s.trim();
    if (s == null) return "";
    try { return String(s).trim(); } catch { return ""; }
  };
  const isDefaultName = (s) => {
    const v = safeTrim(s);
    return v === "Player 1" || v === "Player 2";
  };

  // ✅ 초기 1회만 컨트롤러의 이름을 로컬에 반영 (이후엔 로컬만 신뢰)
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    const n1 = safeTrim(player1?.name);
    const n2 = safeTrim(player2?.name);
    if (!isDefaultName(n1)) setNameP1(n1);
    if (!isDefaultName(n2)) setNameP2(n2);
    initRef.current = true;
  }, [player1?.name, player2?.name]);

  // 컨트롤러에 이름 쓰기
  const writeNameToController = (idx, value) => {
    try {
      controller.setPlayerName?.(idx, value ?? "");
    } catch (e) {
      console.error("setPlayerName error:", e);
    }
  };

  // file:// 스킴 보장
  const toFileURL = (p) => {
    if (!p) return "";
    const hasScheme = /^([a-z]+):\/\//i.test(p);
    if (hasScheme) return p;
    const normalized = p.replace(/\\/g, "/");
    return `file:///${normalized.replace(/^\/+/, "")}`;
  };

  // 사진 촬영 + 저장 (중복 방지 락 + 로컬 이름 사용)
  const handleCapture = async (idx) => {
    if (capBusy[idx]) return; // 이미 캡처 중이면 무시

    const localName = idx === 0 ? nameP1 : nameP2; // 👈 로컬 이름 신뢰
    const name = safeTrim(localName);
    if (!name) {
      alert("먼저 플레이어 이름을 입력해주세요.");
      return;
    }

    // 락 획득
    setCapBusy((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });

    try {
      // 카운트다운 제거 → 바로 카메라 사운드
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
              setNameP1(v);                // 로컬 즉시 반응
              writeNameToController(0, v); // 컨트롤러에도 반영
            }}
          />
          <div className="photo-box">
            {player1?.photoPath ? (
              <img
                key={player1.photoPath}
                src={player1.photoPath}
                alt="player1"
                onError={(e) => {
                  const [base] = (player1.photoPath || "").split("?");
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
            value={nameP2}
            onFocus={() => {
              setFocusedInput("p2");
              SoundManager.play("clickTurn");
            }}
            onChange={(e) => {
              const v = e.target.value;
              setNameP2(v);
              writeNameToController(1, v);
            }}
          />
          <div className="photo-box">
            {player2?.photoPath ? (
              <img
                key={player2.photoPath}
                src={player2.photoPath}
                alt="player2"
                onError={(e) => {
                  const [base] = (player2.photoPath || "").split("?");
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
            사진 촬영
          </button>
        </div>
      </div>

      {/* Game Start */}
      <div className="start-container">
        <button
          className="start-btn"
          onClick={handleStartGame}
          disabled={!safeTrim(nameP1) || !safeTrim(nameP2)}
        >
          Game Start
        </button>

        {/* 가상 키보드 → 로컬/컨트롤러 동시 반영 (포커스 가드로 반대편 동시 수정 방지) */}
        <CustomKeyboard
          viewType="config"
          focusedInput={focusedInput}
          setPlayer1={(txt) => {
            if (focusedInput !== "p1") return; // 포커스된 쪽만 반응
            const v = txt ?? "";
            setNameP1(v);
            writeNameToController(0, v);
          }}
          setPlayer2={(txt) => {
            if (focusedInput !== "p2") return; // 포커스된 쪽만 반응
            const v = txt ?? "";
            setNameP2(v);
            writeNameToController(1, v);
          }}
        />
      </div>
    </div>
  );
}
