// PlayerConfigurationView.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameController } from "../hooks/useGameController";
import CustomKeyboard from "../components/CustomKeyboard";
import SoundManager from "../models/SoundManager";

export default function PlayerConfigurationView() {
  // UI-only states
  const [focusedInput, setFocusedInput] = useState(null); // "p1" | "p2" | null
  const [nameP1, setNameP1] = useState("");
  const [nameP2, setNameP2] = useState("");
  const [photoP1, setPhotoP1] = useState(null);
  const [photoP2, setPhotoP2] = useState(null);
  const [capBusy, setCapBusy] = useState([false, false]);

  const navigate = useNavigate();
  const { state, controller } = useGameController();

  useEffect(() => {
    // 초기화
    setNameP1("");
    setNameP2("");
    setPhotoP1(null);
    setPhotoP2(null);

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
  }, [controller]);

  if (!controller) return <div>Error: Controller not found</div>;

  const safeTrim = (s) => {
    if (typeof s === "string") return s.trim();
    if (s == null) return "";
    try {
      return String(s).trim();
    } catch {
      return "";
    }
  };

  const writeNameToController = (idx, value) => {
    try {
      controller.setPlayerName?.(idx, value ?? "");
    } catch (e) {
      console.error("setPlayerName error:", e);
    }
  };

  const toFileURL = (p) => {
    if (!p) return "";
    const hasScheme = /^([a-z]+):\/\//i.test(p);
    if (hasScheme) return p;
    const normalized = p.replace(/\\/g, "/");
    return `file:///${normalized.replace(/^\/+/, "")}`;
  };

  const handleCapture = async (idx) => {
    if (capBusy[idx]) return;

    const localName = idx === 0 ? nameP1 : nameP2;
    const name = safeTrim(localName);
    if (!name) {
      alert("먼저 플레이어 이름을 입력해주세요.");
      return;
    }

    setCapBusy((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });

    try {
      SoundManager.play("kamera");

      if (!window?.electronAPI?.captureFace) {
        console.error("electronAPI.captureFace not available");
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

      const fileSrc = toFileURL(fileUrl);

      if (idx === 0) {
        setPhotoP1(fileSrc);
        controller.setPlayerPhoto?.(0, fileSrc);
      } else {
        setPhotoP2(fileSrc);
        controller.setPlayerPhoto?.(1, fileSrc);
      }
    } finally {
      setCapBusy((prev) => {
        const next = [...prev];
        next[idx] = false;
        return next;
      });
    }
  };

  const handleStartGame = () => {
    SoundManager.play("clickGameStart");

    // navigate에는 JSON 직렬화 가능한 값만 전달
    const p1 = {
      name: safeTrim(nameP1),
      photo: photoP1,
      score: 0,
      combo: 0,
      hp: 5,
    };
    const p2 = {
      name: safeTrim(nameP2),
      photo: photoP2,
      score: 0,
      combo: 0,
      hp: 5,
    };

    navigate("/game", {
      state: {
        player1: p1,
        player2: p2,
        difficulty: 0,
      },
      replace: false,
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
            placeholder="Input your name"
            value={nameP1}
            onFocus={() => {
              setFocusedInput("p1");
              SoundManager.play("clickTurn");
            }}
            onChange={(e) => {
              const v = e.target.value;
              setNameP1(v);
              writeNameToController(0, v);
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
                }}
              />
            ) : (
              "👤"
            )}
          </div>
          <button
            className="btn-capture"
            onClick={() => handleCapture(0)}
            disabled={capBusy[0]}
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
            placeholder="Input your name"
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
                }}
              />
            ) : (
              "👤"
            )}
          </div>
          <button
            className="btn-capture"
            onClick={() => handleCapture(1)}
            disabled={capBusy[1]}
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

        {/* 가상 키보드 */}
        <CustomKeyboard
          viewType="config"
          focusedInput={focusedInput}
          setPlayer1={(txt) => {
            if (focusedInput !== "p1") return;
            const v = txt ?? "";
            setNameP1(v);
            writeNameToController(0, v);
          }}
          setPlayer2={(txt) => {
            if (focusedInput !== "p2") return;
            const v = txt ?? "";
            setNameP2(v);
            writeNameToController(1, v);
          }}
        />
      </div>
    </div>
  );
}
