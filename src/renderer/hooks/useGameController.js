// src/renderer/hooks/useGameController.js
import { useEffect, useMemo, useRef, useState } from "react";
import { GameController } from "../controller/GameController";

export function useGameController() {
  const controller = useMemo(() => new GameController(), []);
  const [state, setState] = useState(controller.state);
  const didInit = useRef(false);

  useEffect(() => {
    const unsub = controller.subscribe(setState);
    controller.mount();

    if (!didInit.current) {
      didInit.current = true;
      controller.startInitialGame(); // ✅ 항상 5×5로 시작
    }

    return () => { controller.unmount(); unsub(); };
  }, [controller]);

  return { controller, state };
}
