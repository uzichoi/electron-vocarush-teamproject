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
  const [photoP1, setPhotoP1] = useState(null); // Player 1 사진 상태
  const [photoP2, setPhotoP2] = useState(null); // Player 2 사진 상태
  const [capBusy, setCapBusy] = useState([false, false]);

  const navigate = useNavigate();
  const { state, controller } = useGameController();
  const { player1, player2 } = state || {};

  let difficulty = state?.difficulty ?? 0;  // `state.difficulty` 값이 전달되지 않으면 기본값 0을 사용

  useEffect(() => {
    difficulty = 0;
    console.log("Received difficulty:", difficulty);
  }, [difficulty]);

  // 새로고침 시 초기화 (컴포넌트가 처음 렌더링될 때마다)
  useEffect(() => {
    setNameP1("");
    setNameP2("");
    setPhotoP1(null);  // 사진 초기화
    setPhotoP2(null);  // 사진 초기화

    if (controller) {
      try {
        controller.setPlayerName?.(0, "");
        controller.setPlayerName?.(1, "");
        controller.setPlayerPhoto?.(0, null);
        controller.setPlayerPhoto?.(1, null);
      } catch (e) {
        console.error("Controller 초기화 오류:", e);
      }
    }

    SoundManager.stopBgm();

  }, [controller]); // 빈 배열로 설정하면 최초 렌더링 시에만 호출

  if (!controller) return <div>Error: Controller not found</div>;

  // 안전 문자열/기본명 판별
  const safeTrim = (s) => {
    if (typeof s === "string") return s.trim();
    if (s == null) return "";
    try { return String(s).trim(); } catch { return ""; }
  };

  // 컨트롤러에 이름 쓰기
  const writeNameToController = (idx, value) => {
    try {
      controller.setPlayerName?.(idx, value ?? "");
    } catch (e) {
      console.error("setPlayerName error:", e);
    }
  };

  // file:// 스킴 보장 (toFileURL 함수 정의)
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

      const fileSrc = toFileURL(fileUrl);  // file:// URL로 변환

      // Player 1과 Player 2의 사진 경로 저장
      if (idx === 0) {
        setPhotoP1(fileSrc);
        controller.setPlayerPhoto?.(0, fileSrc); // 내부에서 photoPath로 저장되도록
      } else {
        setPhotoP2(fileSrc);
        controller.setPlayerPhoto?.(1, fileSrc); // 내부에서 photoPath로 저장되도록
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
    navigate("/game", {
      state: {
        ...state,
        difficulty:0,
      },
      replace: false,
      key: Date.now()
     
    });
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
              setNameP2(v);
              writeNameToController(1, v);
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