import { GameBoard } from "../models/GameBoard";
import { Direction, Order } from "../models/Direction";
import { Difficulty, BoardSize, PlaceWordLength } from "../models/GameConfig.js";
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

    const difficulty = Object.values(Difficulty);

    // 난이도
    this.initialGameDifficulty = Difficulty.VERYEASY; // 초기 난이도
    this.currentGameDifficulty = Difficulty.VERYEASY; // 현재 난이도

    // 보드크기
    this.initialSize = BoardSize[this.initialGameDifficulty]; // 초기 보드 크기
    this.currentSize = BoardSize[this.currentGameDifficulty]; // 현재 보드 크기
    this.maxSize = 7; // 최대 보드 크기
    
    // 단어 길이
    this.initialwordLength  = PlaceWordLength[this.initialGameDifficulty]; // 초기 단어 길이
    this.currentWordLength = PlaceWordLength[this.currentGameDifficulty]; // 현재 단어 길이
    this.state = {
      //currentWord: "about",
      //foundLetters: ["a","b","o","u","t"],
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

startInitialGame(){
    this.currentSize = this.initialSize;
    this._resetRoundStats();
    this.newGame({ rows: this.currentSize, cols:this.currentSize, words:this._pickWordsForSize(this.currentSize) });
  }

  restartGame() { // 게임 난이도가 올라갈 때마다 호출 (보드크기, 글자크기 변경)
    this.currentGameDifficulty = Math.min(this.currentGameDifficulty + 1, Difficulty.VERYHARD); // 현재 난이도 값에 +1을 해서 한 단계 올림, min으로 최대 값(VERYHARD=4)을 넘지 않게 제한
    
    this.currentSize = BoardSize[this.currentGameDifficulty];
    this.currentWordLength = PlaceWordLength[this.currentGameDifficulty];

    this._resetRoundStats();
    this.newGame({ rows: this.currentSize, cols: this.currentSize, words: this._pickWordsForSize(this.currentSize) });
  }

  //상태에 반영 (깊은 복사) ***************************************** 보드가 바뀔때 마다 상태를 반영해야 안전함
  updateGridState() {
    const snap = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;
    const deep = snap.map(row => [...row]);
    this.setState({ ...this.state, grid: deep });
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
  async newGame(opts = { rows:10, cols: 10, words: ["about","korea","apple","storm","logic"] }) {
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

    await this.board.fileRead();
    // 4) 의도로 배치하지 않은 단어 제거 (더이상 변경된 단어가 없을 때까지 반복)
  let changed = true;
  while (changed) {
  changed = this.board.unintendedWordDelete();
    }
    this.updateGridState();
  }

  // board APIs
  setBoardSize(row, col) {
    this.board.setBoardSize(row, col);
     this.updateGridState();
  }
  
  
    

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
