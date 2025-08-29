import { useEffect, useRef, useState } from "react";
// useEffect: 특정 타이밍에 동작 실행
// useRef: 컴포넌트 안에서 유지되는 고정값 저장
// useState: 상태값(state) 관리

import { GameController } from "../controller/GameController";

export function useGameController() {
  // 1) 컨트롤러를 한 번만 생성
  const controllerRef = useRef(null);   // null로 초기화된 Ref 객체 생성
  if (!controllerRef.current) {    // 이미 있으면 재사용, 아직 없으면 새로 생성
    controllerRef.current = new GameController();   // 리렌더링 반복되어도, gameController를 한 번만 생성하기 위함
  }
  const controller = controllerRef.current;

  // 2) 상태 관리
  const [state, setState] = useState(controller.state); // 상태, 상태 변경 함수(setter) 생성. controller 내부 상태로 초기화

  // 3️) 초기화 체크
  const didInit = useRef(false);  // 또다른 Ref 객체. flase로 시작. 초기화 여부 체크하는 플래그

  useEffect(() => {
    // 구독
    const unsub = controller.subscribe(setState);   // controller가 상태 변화를 감지하면 setState() 호출
    controller.mount();   // 컨트롤러 시작 준비. 게임 루프/타이머 on

    if (!didInit.current) {   // 최초 1회만 초기화 실행 (didInit == false일 때만)
      didInit.current = true; 
      controller.startInitialGame(); // 초기 게임 시작 (5x5)
    }

    return () => {    // cleanup. 컴포넌트 사라질 때 실행됨
      controller.unmount();   // 이벤트 정리
      unsub();    // 구독 해제
    };
  }, [controller]);   // controller 변경될 때마다 실행

  // 4) nextRound 함수: 난이도 증가 + 새 보드
  const nextRound = async () => {
    await controller.restartGame(); // GameController 내부에서 난이도 증가, 보드 크기/단어 길이 자동 적용
  };

  // 5) submitInput & setInputValue 래핑
  const submitInput = (input, playerIndex = 0) => {   
    controller.submitInput(input, playerIndex); // 플레이어 인덱스를 controller에 전달
  };

  const setInputValue = (value) => {
    controller.setInputValue(value);  // 해당 플레이어 인덱스를 controller에 전달
  };

  return { controller, state, nextRound, submitInput, setInputValue };
}
