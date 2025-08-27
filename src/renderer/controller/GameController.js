import { GameBoard } from "../models/GameBoard";
import { Direction } from "../models/Direction";
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

    this.initialSize = 5;
    this.currentSize = 6;
    this.maxSize = 7;

    this.startInitialGame = this.startInitialGame.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.hardResetToFirst = this.hardResetToFirst.bind(this);

    this.state = {
      currentWord: "about",
      foundLetters: ["a","b","o","u","t"],
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
  unmount() { if (this.timerId) clearInterval(this.timerId); }

  subscribe(listener) { listener(this.state); return this.emitter.on(listener); }

 startInitialGame = () => {
  this.currentSize = this.initialSize || 6;
  this._resetRoundStats();
  this.newGame({
    rows: this.currentSize,
    cols: this.currentSize,
    words: this._pickWordsForSize(this.currentSize)
  });
};


  restartGame() {
    if (this.currentSize < this.maxSize) this.currentSize += 1;
    this._resetRoundStats();
    this.newGame({ rows: this.currentSize, cols: this.currentSize, words: this._pickWordsForSize(this.currentSize) });
  }

  // (선택) 완전 새로 시작 버튼이 있다면 이것만 호출
  hardResetToFirst() {
    this.startInitialGame();
  }

  _resetRoundStats() {
    // 라운드마다 리셋할 것들 (원하면 점수 유지/리셋 정책 조정)
    const p1 = { ...this.state.player1, combo: 0, maxCombo: 0, hp: 3 /*, score: 0*/ };
    const p2 = { ...this.state.player2, combo: 0, maxCombo: 0, hp: 3 /*, score: 0*/ };
    this.setState({ ...this.state, player1: p1, player2: p2, timeIncreased: 0, inputValue: "" });
  }

  _pickWordsForSize(size) {
    // 보드 크기에 따라 단어 난이도/개수를 조정하고 싶으면 여기서 결정
    // 지금은 예시로 동일하게 사용
    return ["about","korea","apple","storm","logic"];
  }

  
  // ★ 새 게임: 보드 초기화 + 단어 랜덤 배치 + 빈칸 채우기 + 상태 반영
  newGame(opts = { rows:this.currentSize, cols: this.currentSize, words: this._pickWordsForSize(this.currentSize) }) {
    const { rows, cols, words } = opts;

    // 1) 보드 리셋
    this.board.setSize(rows, cols);
    this.board.clear();
    this.words = [];

    // 2) 단어 랜덤 배치
    const directions = Object.values(Direction); // Direction은 {HORIZONTAL:..., VERTICAL:..., ...} 형태라고 가정
    for (const text of words) {
      let placed = false;
      for (let tries = 0; tries < 200 && !placed; tries++) {
        const x = Math.floor(Math.random() * cols);
        const y = Math.floor(Math.random() * rows);
        const dir = pick(directions);
        const w = new Word(text.toLowerCase());
        w.setPosition(x, y, dir);
        if (this.board.canPlaceWord(w)) {
          this.board.placeWord(text.toLowerCase(), x, y, dir);
          this.words.push(w);
          placed = true;
        }
      }
    }

    // 3) 빈칸 랜덤 문자로 채우기
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!this.board.grid[r][c] || this.board.grid[r][c] === "*") {
          this.board.grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    // 4) 상태에 반영 (깊은 복사)
    const snap = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;
    const deep = snap.map(row => [...row]);
    this.setState({ ...this.state, grid: deep });
  }

  // board APIs
  setBoardSize(row, col) {
    this.board.setSize(row, col);
    this.board.clear();
    const snap = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;
    const deep = snap.map(row => [...row]);
    this.setState({ ...this.state, grid: deep });
  }

  placeWordOnBoard(text, x, y, direction = Direction.HORIZONTAL) {
    const w = new Word(text.toLowerCase());
    w.setPosition(x, y, direction);
    if (!this.board.canPlaceWord(w)) return false;
    this.board.placeWord(text.toLowerCase(), x, y, direction);
    this.words.push(w);

    const snap = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;
    const deep = snap.map(row => [...row]);
    this.setState({ ...this.state, grid: deep });
    return true;
  }

  submitInput(wordRaw) {
    const guess = (wordRaw || "").trim().toLowerCase();
    if (!guess) return;

    const match = this.words.find(w => !w.isFound() && w.getText() === guess);
    if (match) {
      match.markFoundWord();
      this.board.highlightWord(match);

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
