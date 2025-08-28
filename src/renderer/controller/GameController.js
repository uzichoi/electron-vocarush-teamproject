import { GameBoard } from "../models/GameBoard";
import { Direction, Order } from "../models/Direction";
import { Word } from "../models/Word";

class Emitter {
  constructor() { this.listeners = new Set(); }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(payload) { this.listeners.forEach(fn => fn(payload)); }
}

export class GameController {
  constructor() {
    this.board = new GameBoard();
    this.words = [];
    this.emitter = new Emitter();

    // 타이머
    this.timerId = null;     // 전체 게임 타이머
    this.turnTimer = null;   // 턴 타이머

    // 보드 크기
    this.initialRowSize = 6;
    this.initialColSize = 5;
    this.maxSize = 7;
    this.currentRowSize = this.initialRowSize;
    this.currentColSize = this.initialColSize;

    this.state = {
      // 타이머 관련
      timeIncreased: 0,
      turnActive: false,
      currentTurn: null,
      turnTime: 0,

      // 입력
      inputValue: "",

      // 플레이어 상태
      player1: { name: "Player 1", score: 0, combo: 0, maxCombo: 0, hp: 5 },
      player2: { name: "Player 2", score: 0, combo: 0, maxCombo: 0, hp: 5 },

      // 보드
      grid: []
    };
  }

  // =====================
  // 전체 게임 타이머
  // =====================
  mount() {
    this.timerId = setInterval(() => {
      this.setState({ ...this.state, timeIncreased: this.state.timeIncreased + 1 });
    }, 1000);
  }
  unmount() {
    if (this.timerId) clearInterval(this.timerId);
    if (this.turnTimer) clearInterval(this.turnTimer);
  }

  subscribe(listener) {
    listener(this.state);
    return this.emitter.on(listener);
  }

  // =====================
  // 보드 관련
  // =====================
  updateGridState() {
    const snap = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;
    const deep = snap.map(row => [...row]);
    this.setState({ ...this.state, grid: deep });
  }

  startInitialGame = () => {
    this.currentRowSize = this.initialRowSize || 5;
    this.currentColSize = this.initialColSize || 5;
    this.newGame({
      rows: this.currentRowSize,
      cols: this.currentColSize,
      words: this._pickWordsForSize(Math.min(this.currentRowSize, this.currentColSize))
    });
  };

  restartGame() {
    if (this.currentRowSize < this.maxSize) this.currentRowSize += 1;
    if (this.currentColSize < this.maxSize) this.currentColSize += 1;
    this.newGame({
      rows: this.currentRowSize,
      cols: this.currentColSize,
      words: this._pickWordsForSize(Math.min(this.currentRowSize, this.currentColSize))
    });
  }

  _pickWordsForSize(size) {
    return ["about", "korea", "apple", "storm", "logic"];
  }

  newGame(opts) {
    const { rows, cols, words } = opts;

    // 1) 보드 초기화
    this.board.resetBoard(rows, cols);
    this.words = [];

    // 2) 단어 랜덤 배치
    const directions = Object.values(Direction);
    const orders = Object.values(Order);
    this.words = this.board.placeWordsRandomly(words, directions, orders, 200);

    // 3) 빈칸 채우기
    this.board.fillEmptyWithRandomLetters();

    // 4) 상태 업데이트
    this.updateGridState();
  }

  // =====================
  // 턴 관리
  // =====================
  startTurn(player) {
    if (this.turnTimer) clearInterval(this.turnTimer);

    this.setState({
      ...this.state,
      currentTurn: player,
      turnActive: true,
      turnTime: 10,
      inputValue: ""
    });

    this.turnTimer = setInterval(() => {
      if (this.state.turnTime > 0) {
        this.setState({ ...this.state, turnTime: this.state.turnTime - 1 });
      } else {
        clearInterval(this.turnTimer);
        this.setState({ ...this.state, turnActive: false, turnTime: 0 });
      }
    }, 1000);
  }

  // =====================
  // 입력 처리
  // =====================
  setInputValue(v) {
    this.setState({ ...this.state, inputValue: v });
  }

  submitInput(wordRaw) {
    const guess = (wordRaw || "").trim().toLowerCase();
    if (!guess) return;

    let nextState = { ...this.state };

    if (this.state.currentTurn === "player1") {
      if (this._checkWord(guess)) {
        nextState.player1.score += 100;
        nextState.player1.combo += 1;
        nextState.player1.maxCombo = Math.max(nextState.player1.maxCombo, nextState.player1.combo);
        nextState.player2.hp = Math.max(0, nextState.player2.hp - 1);
      } else {
        nextState.player1.combo = 0;
        nextState.player1.hp = Math.max(0, nextState.player1.hp - 1);
      }
    } else if (this.state.currentTurn === "player2") {
      if (this._checkWord(guess)) {
        nextState.player2.score += 100;
        nextState.player2.combo += 1;
        nextState.player2.maxCombo = Math.max(nextState.player2.maxCombo, nextState.player2.combo);
        nextState.player1.hp = Math.max(0, nextState.player1.hp - 1);
      } else {
        nextState.player2.combo = 0;
        nextState.player2.hp = Math.max(0, nextState.player2.hp - 1);
      }
    }

    // 턴 종료
    nextState.inputValue = "";
    nextState.turnActive = false;
    nextState.turnTime = 0;
    this.setState(nextState);

    if (this.turnTimer) clearInterval(this.turnTimer);
  }

  // 단어 체크 로직
  _checkWord(word) {
    return this.words.some(w => w.getText && w.getText() === word);
  }

  // =====================
  // 상태 업데이트
  // =====================
  setState(next) {
    this.state = next;
    this.emitter.emit(this.state);
  }
}
