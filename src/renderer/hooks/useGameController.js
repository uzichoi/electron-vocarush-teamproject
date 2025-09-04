import { useEffect, useRef, useState } from "react";
import { gameController } from "../controller/GameController";

export function useGameController() {
  const [state, setState] = useState(gameController.state);
  const didInit = useRef(false);

  useEffect(() => {
    const unsub = gameController.subscribe(setState);
    gameController.mount();

    if (!didInit.current) {
      didInit.current = true;
      gameController.startInitialGame(); // 보드 초기화
    }

    return () => {
      gameController.unmount();
      unsub();
    };
  }, []);

  return { controller: gameController, state };
}
