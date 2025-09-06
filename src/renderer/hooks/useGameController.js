// hooks/useGameController.js
import { useEffect, useRef, useState } from "react";
import { GameController } from "../controller/GameController";

export function useGameController() {
  // 1) 컨트롤러를 한 번만 생성
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    controllerRef.current = new GameController();
  }
  const controller = controllerRef.current;

  // 2) 상태 관리
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

  return {
    controller,
    state,
    submitInput,
    setInputValue,
    startTurn,
    nextRound
  };
}
