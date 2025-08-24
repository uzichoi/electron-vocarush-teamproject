// GameController.js
// 게임 전체 상태를 관리하는 중앙 컨트롤러

import { GameBoard } from "../models/GameBoard";
import { Direction } from "../models/Direction";
import { Word } from "../models/Word";

function pick(arr) {    // 배열에서 랜덤하게 하나의 요소를 선택해서 반환하는 함수
  return arr[Math.floor(Math.random() * arr.length)];   
  // Math.random()은 0 이상 1 미만의 부동소수를 반환
  // Math.floor()로 정수화하여 배열 인덱스를 안전하게 생성
  // 해당 인덱스의 요소 리턴
}

// 간단한 이벤트 emitter (리액트 상태 없이 직접 상태 전달)
// 옵저버 패턴 구현: 이벤트를 발생시키고 여러 리스너들이 그 이벤트를 구독할 수 있게 한다.
class Emitter {
  constructor() { 
    this.listeners = new Set();   // Set: 순서가 없고 중복되지 않은 데이터의 집합. 배열과 비슷하지만 중복을 자동으로 제거해줌
    // listeners라는 set을 만들어 리스너 함수들을 저장한다.
  }
  on(listener) {  // 이벤트 리스너 등록
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(data) {   // 등록된 모든 리스너들에게 데이터를 전달하며 실행
    this.listeners.forEach(listener => listener(data));
  }
}

export class GameController {   
  constructor() {
    this.board = new GameBoard();   // 게임 보드 객체
    this.words = [];                // 숨겨진 단어 목록
    this.emitter = new Emitter();   // 상태 변화 알림용
    this.timerId = null;            // 타이머 ID 저장
    this.currentPlayerIndex = 0;    // 현재 플레이어 인덱스

    this.state = {    // 게임 상태 정보
      grid: [],       // 게임 보드 2차원 배열
      currentWord: "",    // ** 정답 후보 보여주기용 변수. 실제 게임 진행에서 사용되지 않으므로 삭제하거나 추후 용도 정리 필요
      inputValue: "",     // 입력창 상태
      timeIncreased: 0,   // 시간 측정
      player1: { name: "Player 1", score: 0, combo: 0, maxCombo: 0, hp: 3 },  // 플레이어 1 정보
      player2: { name: "Player 2", score: 0, combo: 0, maxCombo: 0, hp: 3 },  // 플레이어 2 정보
    };
  }

  // 생명주기 관리
  mount() {   // 게임 시작할 때 
    this.timerId = setInterval(() => {  // 1초마다 시간을 1씩 증가시키는 타이머 시작
      this.setState({ timeIncreased: this.state.timeIncreased + 1 });
    }, 1000);
  }

  unmount() { // 게임 종료할 때 
    if (this.timerId) clearInterval(this.timerId);  // 타이머 정리(메모리 누수 방지)
  }

  // 상태 관리
  subscribe(listener) {   // 변경 사항 구독('상태가 바뀔 때마다 자동으로 알려달라'는 요청). 현재 상태를 즉시 전달하고, 앞으로의 변화도 구독
    listener(this.state); // 현재 상태 즉시 전달
    return this.emitter.on(listener); // 변화 구독
  }

  setState(partialState) {  // 상태 업데이트 
    // 스프레드 문법(배열이나 객체를 펼쳐서 개별 요소로 분리하는 문법) 사용
    // 게임 상태를 '부분적으로' 업데이트하기 위한 목적
    this.state = { ...this.state, ...partialState };  // { ...기존상태, ...변경할부분 }
    this.emitter.emit(this.state);  // 모든 구독자에게 알림
  }

  getCurrentPlayer() {
    return this.currentPlayerIndex === 0 ? "player1" : "player2";   // "===": 엄격한 비교. 타입과 값이 모두 같아야 true
  }

  getOpponentPlayer() {
    return this.currentPlayerIndex === 0 ? "player2" : "player1";
  }

  switchTurn() {
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;   // 플레이어 인덱스 토글(toggle)
  }

  newGame({ rows = 5, cols = 5, words = ["apple", "korea", "hello"] } = {}) {
    this.board.setSize(rows, cols);
    this.board.clear();
    this.words = [];

    for (const wordText of words) {
      let placed = false;
      for (let i = 0; i < 100 && !placed; i++) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        const dir = pick(Object.values(Direction));
        const word = new Word(wordText);
        word.setPosition(x, y, dir);
        if (this.board.canPlaceWord(word)) {
          this.board.placeWord(wordText, x, y, dir);
          this.words.push(word);
          placed = true;
        }
      }
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!this.board.grid[r][c] || this.board.grid[r][c] === "*") {
          this.board.grid[r][c] = pick(letters);
        }
      }
    }

    this.setState({
      grid: this.board.grid.map(row => [...row]),
      inputValue: "",
      timeIncreased: 0,
      currentWord: "",
      player1: { name: "Player 1", score: 0, combo: 0, maxCombo: 0, hp: 3 },
      player2: { name: "Player 2", score: 0, combo: 0, maxCombo: 0, hp: 3 },
    });
  }

  setInputValue(v) {
    this.setState({ inputValue: v });
  }

  submitInput() {
    const guess = this.state.inputValue.trim().toLowerCase();
    const playerKey = this.getCurrentPlayer();
    const player = { ...this.state[playerKey] };

    const match = this.words.find(w => !w.isFound() && w.getText() === guess);
    if (match) {
      match.markFoundWord();
      this.board.highlightWord(match);
      player.score += 100;
      player.combo += 1;
      player.maxCombo = Math.max(player.maxCombo, player.combo);
    } else {
      player.combo = 0;
      player.hp = Math.max(0, player.hp - 1);
    }

    const nextState = {
      [playerKey]: player,
      inputValue: "",
      grid: this.board.grid.map(row => [...row]),
    };
    this.setState(nextState);
    this.switchTurn();
  }
}