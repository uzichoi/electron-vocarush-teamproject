// hooks/useGameController.js
import { useEffect, useRef, useState } from "react";
import { GameController}  from "../controllers/GameController";

export function useGameController(initialController = null) {
  // // 1) 컨트롤러를 한 번만 생성
  // const controllerRef = useRef(null);
  // if (!controllerRef.current) {
  //   controllerRef.current = new GameController();
  // }
  // const controller = controllerRef.current;

  // 2) 상태 관리
  // 1) controller와 state를 상태로 관리
  const [controller, setController] = useState(() => new GameController());
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
  const startNewGame = () => {
    const newController = new GameController();
    setController(newController);
    setState(newController.state);
    //return newController;
  };

  return {
    controller,
    state,
    submitInput,
    setInputValue,
    startTurn,
    nextRound,
    startNewGame,
  };
}