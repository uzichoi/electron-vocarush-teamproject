import { GameBoard } from "../models/GameBoard";
import { Direction, Order } from "../models/Direction";
import { Word } from "../models/Word";
import Player from "../models/Player";
import Ranking from "../models/Ranking";

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

    this.timerId = null;     // 전체 타이머
    this.turnTimer = null;   // 턴 타이머

    // 보드 크기
    this.initialRowSize = 7;
    this.initialColSize = 7;
    this.maxSize = 7;
    this.currentRowSize = this.initialRowSize;
    this.currentColSize = this.initialColSize;

    this.state = {
      timeIncreased: 0,
      turnActive: false,
      currentTurn: null,
      turnTime: 0,
      inputValue: "",
      player1: new Player("player1"),
      player2: new Player("player2"),
      grid: [],
      gameOver: false //게임 종료 상태
    };

    this.state.player1.setName("Player 1");
    this.state.player2.setName("Player 2");
    this.state.player1.setHP(5);
    this.state.player2.setHP(5);

  }

  


  // =====================
  // 전체 게임 타이머
  // =====================
  mount() {
    this.timerId = setInterval(() => {
      if (!this.state.gameOver) { //게임 끝나면 멈춤
        this.setState({ ...this.state, timeIncreased: this.state.timeIncreased + 1 });
      }
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
  updateGridState = () => {
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
    this.board.resetBoard(rows, cols);
    this.words = [];
    const directions = Object.values(Direction);
    const orders = Object.values(Order);
    this.words = this.board.placeWordsRandomly(words, directions, orders, 200);
    this.board.fillEmptyWithRandomLetters();
    this.updateGridState();
  }

  // =====================
  // 턴 관리
  // =====================
  startTurn(player) {
    if (this.state.turnActive) return;
    if ((player === "player1" && this.state.player1.hp <= 0) ||
        (player === "player2" && this.state.player2.hp <= 0)) return;

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
    if (!guess || !this.state.turnActive) return;

    let nextState = { ...this.state };
    const isCorrect = this._checkWord(guess);

    // 콤보 배율
    const comboMultiplier = (combo) => {
      if(combo >= 3) return 3;
      if(combo === 2) return 2;
      return 1;
    };

    if (this.state.currentTurn === "player1") {
      this.state.player1.addWord(isCorrect);//통계반영
      if (isCorrect) {
        this.state.player1.addCombo();
        this.state.player1.addScore(100);
        this.state.player2.subHP();
        this.state.player2.setCombo(0);
      } else {
        this.state.player1.setCombo(0);
        this.state.player1.subHP();
        }
    } else if (this.state.currentTurn === "player2") {
      this.state.player2.addWord(isCorrect);//통계반영
      if (isCorrect) {
        this.state.player2.addCombo();
        this.state.player2.addScore(100);
        this.state.player1.subHP();
        this.state.player1.setCombo(0);
      } else {
        this.state.player2.setCombo(0);
        this.state.player2.subHP();
        }
    }

    // 턴 종료
    nextState.inputValue = "";
    nextState.turnActive = false;
    nextState.turnTime = 0;
    if (this.turnTimer) clearInterval(this.turnTimer);

    // =====================
    // 게임 종료 조건(랭킹변경)
    // =====================
    const allWordsFound = this.words.every((w) => w.isFound && w.isFound());
    if (nextState.player1.hp <= 0 && nextState.player2.hp <= 0) {
    Ranking.load();
    Ranking.add(nextState.player1.getName(), nextState.player1.getScore());
    Ranking.add(nextState.player2.getName(), nextState.player2.getScore());
    Ranking.save();

    localStorage.setItem("lastWinners", JSON.stringifty([
      nextState.player1.getName(),
      nextState.player2.getName()
    ]));

    setTimeout(() => {
      this.setState({ ...nextState, gameOver: true });
    }, 2000);
  } else if (allWordsFound) {
    Ranking.load();
    Ranking.add(nextState.player1.getName(), nextState.player1.getScore());
    Ranking.add(nextState.player2.getName(), nextState.player2.getScore());
    Ranking.save();

    setTimeout(() => {
      this.setState({ ...nextState, gameOver: true });
    }, 2000);
  } else {
    this.setState(nextState);
  }
  }

  // =====================
  // 단어 체크 + 보드 대문자 변환
  // =====================
  _checkWord(word) {
  const match = this.words.find(
    (w) => !w.isFound?.() && w.getText?.() === word
  );
  if (match) {
    match.markFoundWord?.();
    const coords = match.getCoords?.();

    if (coords) {
      const updatedGrid = this.state.grid.map((row, i) =>
        row.map((cell, j) =>
          coords.some(([x, y]) => x === i && y === j)
            ? cell.toUpperCase()
            : cell
        )
      );
      this.setState({ ...this.state, grid: updatedGrid });
    }
    return true;
  }
  return false;

}

  // =====================
  // setState (화살표 함수로 수정!)
  // =====================
  setState = (next) => {
    this.state = next;
    this.emitter.emit(this.state);
  }
}


export const gameController = new GameController();