import { GameBoard } from "../models/GameBoard";
import { Direction, Order } from "../models/Direction";
import { Word } from "../models/Word";

class Emitter {
  constructor() { this.listeners = new Set(); }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(payload) { this.listeners.forEach(fn => fn(payload)); }
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export class GameController {
  constructor() {
    this.board = new GameBoard();
    this.words = [];
    this.emitter = new Emitter();
    this.timerId = null;

    this.initialRowSize = 5;
    this.initialColSize = 6;
    this.maxSize = 7;

    this.startInitialGame = this.startInitialGame.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.hardResetToFirst = this.hardResetToFirst.bind(this);

    this.state = {
      //currentWord: "about",
      //foundLetters: ["a","b","o","u","t"],
      player1: { name: "Player 1", score: 0, combo: 0, maxCombo: 0, hp: 3 },
      player2: { name: "Player 2", score: 0, combo: 0, maxCombo: 0, hp: 3 },
      inputValue: "",
      timeIncreased: 0,
      grid: [],//Array.from({ length: 6 }, () => Array(6).fill("*")), // newGame에서 채움
    };
  }

  // lifecycle
  mount() {
  this.timerId = setInterval(() => {
    const next = Math.min(300, this.state.timeIncreased + 1);
    this.setState({ ...this.state, timeIncreased: next });
  }, 1000);
}

unmount() { 
  if (this.timerId) clearInterval(this.timerId); 
}

subscribe(listener) { 
  listener(this.state); 
  return this.emitter.on(listener); 
}

// 상태에 반영 (깊은 복사) *****************************************
// 보드가 바뀔 때마다 상태를 반영해야 안전함
updateGridState() {
  const snap = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;
  const deep = snap.map(row => [...row]);
  this.setState({ ...this.state, grid: deep });
}

// 초기 게임 시작
startInitialGame = () => {
  this.currentRowSize = this.initialRowSize || 5; // 최소 5 보장
  this.currentColSize = this.initialColSize || 5;
  this._resetRoundStats();
  this.newGame({
    rows: this.currentRowSize,
    cols: this.currentColSize,
    words: this._pickWordsForSize(this.currentSize)
  });
};

// 라운드 재시작 (최대 7까지만 커짐)
restartGame() {
  if (this.currentSize < 7) this.currentSize += 1;   // maxSize 대신 7로 한정
  this._resetRoundStats();
  this.newGame({ 
    rows: this.currentSize, 
    cols: this.currentSize, 
    minSize: Math.min(this.currentRowSize, this.currentColSize),
    words: this._pickWordsForSize(minSize) 
  });
}

// 완전 초기화
hardResetToFirst() {
  this.startInitialGame();
}

// 라운드 스탯 리셋
_resetRoundStats() {
  const p1 = { ...this.state.player1, combo: 0, maxCombo: 0, hp: 3 };
  const p2 = { ...this.state.player2, combo: 0, maxCombo: 0, hp: 3 };
  this.setState({ 
    ...this.state, 
    player1: p1, 
    player2: p2, 
    timeIncreased: 0, 
    inputValue: "" 
  });
}

// 보드 크기에 따라 단어 선택 (지금은 동일)
_pickWordsForSize(size) {
  return ["about","korea","apple","storm","logic"];
}

  // ★ 새 게임: 보드 초기화 + 단어 랜덤 배치 + 빈칸 채우기 + 상태 반영
  newGame(opts = { rows:this.currentSize, cols: this.currentSize, words: this._pickWordsForSize(this.currentSize) }) {
    const { rows, cols, words } = opts;

    // 1) 보드 리셋
    this.board.resetBoard(rows, cols);
    this.words = [];

    // 2) 단어 랜덤 배치
    const directions = Object.values(Direction); // Direction은 {HORIZONTAL:..., VERTICAL:..., ...} 형태라고 가정
    const orders = Object.values(Order);
    this.words = this.board.placeWordsRandomly(words,directions,orders, 200)

    // 3) 빈칸 랜덤 문자로 채우기
    this.board.fillEmptyWithRandomLetters();
    this.updateGridState();
  }

  // board APIs
  setBoardSize(row, col) {
    this.board.setBoardSize(row, col);
     this.updateGridState();
  }
  
  /*
  // 단어 수동배치??
  placeWordOnBoard(text, x, y, direction = Direction.HORIZONTAL) {
    const w = new Word(text.toLowerCase());
    w.setPosition(x, y, direction);
    if (!this.board.canPlaceWord(w)) return false;
    this.board.placeWord(text.toLowerCase(), x, y, direction);
    this.words.push(w);

     this.updateGridState();
    return true;
  }
    */
    

  submitInput(wordRaw) {
    const guess = (wordRaw || "").trim().toLowerCase();
    if (!guess) return;

    const match = this.words.find(w => !w.isFound() && w.getText() === guess);
    if (match) {
      match.markFoundWord();
      this.board.highlightWord(match);
      this.updateGridState();

      const p1 = { ...this.state.player1 };
      p1.combo += 1;
      p1.maxCombo = Math.max(p1.maxCombo, p1.combo);
      p1.score += 100;

      const snap = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;
      const deep = snap.map(row => [...row]);

      this.setState({ ...this.state, player1: p1, inputValue: "", grid: deep });
    } else {
      const p1 = { ...this.state.player1 };
      p1.combo = 0;
      p1.hp = Math.max(0, p1.hp - 1);
      this.setState({ ...this.state, player1: p1, inputValue: "" });
    }
  }

  setInputValue(v) { this.setState({ ...this.state, inputValue: v.toUpperCase() }); }

  // 초기 랜덤 생성은 사용하지 않음 (newGame에서 처리)
  generateInitialGrid() { return []; }

  setState(next) { this.state = next; this.emitter.emit(this.state); }
}
