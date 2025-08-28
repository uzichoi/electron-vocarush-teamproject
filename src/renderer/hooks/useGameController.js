import { useEffect, useRef, useState } from "react";
import { GameController } from "../controller/GameController";

export function useGameController() {
  // 1️⃣ 컨트롤러를 한 번만 생성
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    controllerRef.current = new GameController();
  }
  const controller = controllerRef.current;

  // 2️⃣ 상태 관리
  const [state, setState] = useState(controller.state);

  // 3️⃣ 초기화 체크
  const didInit = useRef(false);

  useEffect(() => {
    // 구독
    const unsub = controller.subscribe(setState);
    controller.mount();

    if (!didInit.current) {
      didInit.current = true;
      controller.startInitialGame(); // 초기 게임 시작 (5x5)
    }

    return () => {
      controller.unmount();
      unsub();
    };
  }, [controller]);

  // 4️⃣ nextRound 함수: 난이도 증가 + 새 보드
  const nextRound = async () => {
    await controller.restartGame(); // GameController 내부에서 난이도 증가, 보드 크기/단어 길이 자동 적용
  };

  // 5️⃣ submitInput & setInputValue 래핑
  const submitInput = (input, playerTurn = 0) => {
    controller.submitInput(input, playerTurn);
  };

  const setInputValue = (value) => {
    controller.setInputValue(value);
  };

  return { controller, state, nextRound, submitInput, setInputValue };
}
