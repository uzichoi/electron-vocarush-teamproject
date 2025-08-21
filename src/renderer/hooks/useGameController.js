import { useEffect, useMemo, useState } from "react";
import { GameController } from "../controller/GameController";

export function useGameController() {
  const controller = useMemo(() => new GameController(), []);
  const [state, setState] = useState(controller.state);

  useEffect(() => {
    const unsub = controller.subscribe(setState);
    controller.mount();

    // ★ 마운트 시 보드 랜덤 배치 1회
    controller.newGame({
      rows: 10,
      cols: 10,
      words: ["about","korea","apple"]//,"storm","logic"], // 원하는 단어들
    });

    return () => { controller.unmount(); unsub(); };
  }, [controller]);

  return { controller, state };
}
