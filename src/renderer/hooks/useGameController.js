// src/renderer/hooks/useGameController.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GameController } from "../controllers/GameController";

const Ctx = createContext(null);

export function GameControllerProvider({ children }) {
  // 컨트롤러는 Provider 생애주기 동안 단 1회만 생성
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    controllerRef.current = new GameController();
  }
  const controller = controllerRef.current;

  // 컨트롤러의 상태를 React로 브리지
  const [state, setState] = useState(controller.state);

  useEffect(() => {
    // 컨트롤러가 전체 state를 emit하도록 가정 (부분패치면 prev merge로 바꿔도 됨)
    const unsubscribe = controller.subscribe((next) => setState(next));
    controller.mount?.(); // Provider 마운트 시 1회
    return () => {
      controller.unmount?.(); // Provider 언마운트 시 1회
      unsubscribe?.();
    };
  }, [controller]);

  const value = useMemo(() => ({ controller, state }), [controller, state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGameController() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useGameController must be used inside GameControllerProvider");
  }
  return ctx; // { controller, state }
}
