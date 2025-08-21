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
    this.state = {
      currentWord: "about",
      foundLetters: ["a","b","o","u","t"],
      player1: { name: "Player 1", score: 0, combo: 0, maxCombo: 0, hp: 3 },
      player2: { name: "Player 2", score: 0, combo: 0, maxCombo: 0, hp: 3 },
      inputValue: "",
      timeIncreased: 0,
      grid: [], // newGame에서 채움
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

  // ★ 새 게임: 보드 초기화 + 단어 랜덤 배치 + 빈칸 채우기 + 상태 반영
  newGame(opts = { rows:10, cols: 10, words: ["about","korea","apple","storm","logic"] }) {
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
