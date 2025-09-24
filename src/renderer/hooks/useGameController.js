// src/renderer/hooks/useGameController.js
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GameController } from "../controllers/GameController";

const Ctx = createContext(null);

export function GameControllerProvider({ children }) {
  // 1) 컨트롤러는 Provider 생애주기 동안 단 1회 생성
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    controllerRef.current = new GameController();
  }
  const controller = controllerRef.current;

  // 2) 컨트롤러 state를 React state로 브리지
  const [state, setState] = useState(controller.state);

  useEffect(() => {
    // subscribe가 없다면 아래 3번 참고해 메서드 추가
    const unsubscribe = controller.subscribe((next) => {
      // next가 통짜 state면 그대로, partial이면 머지
      setState(next);
    });
    controller.mount?.();               // ❗ Provider가 마운트될 때 한 번만
    return () => {
      controller.unmount?.();           // ❗ Provider가 언마운트될 때 한 번만
      unsubscribe?.();
    };
  }, [controller]);

  const value = useMemo(() => ({ controller, state }), [controller, state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/*export function useGameController(initialController = null) {
  // // 1) 컨트롤러를 한 번만 생성
  // const controllerRef = useRef(null);
  // if (!controllerRef.current) {
  //   controllerRef.current = new GameController();
  // }
  // const controller = controllerRef.current;

  // 2) 상태 관리
  // 1) controller와 state를 상태로 관리
  //const [controller, setController] = useState(() => new GameController());
    // GameView 진입 시점에만 새 컨트롤러 생성
  const controllerRef = useRef(new GameController());
  const controller = controllerRef.current;
  
  const [state, setState] = useState(controller.state);

  // 3) 초기화 및 구독
  useEffect(() => {
    const unsub = controller.subscribe(setState); // state 변경 시 setState 호출
    controller.mount(); // 전체 타이머 시작

    return () => {
      controller.unmount(); // 타이머 정리
      unsub(); // 구독 해제
    };
  }, [controller]);

  // 4) submitInput, setInputValue 래핑
  const submitInput = (word) => controller.submitInput(word);
  const setInputValue = (value) => controller.setInputValue(value);
  const startTurn = (playerKey) => controller.startTurn(playerKey);
  const nextRound = () => controller.restartGame();

  // 4) 새 게임 시작 (Restart 또는 Start 버튼)
  // const startNewGame = () => {
  //   const newController = new GameController();
  //   setController(newController);
  //   setState(newController.state);
  //   //return newController;
  // };

  return {
    controller,
    state,
    submitInput,
    setInputValue,
    startTurn,
    nextRound,
    startNewGame: () => controller.startInitialGame(),
  };
}*/