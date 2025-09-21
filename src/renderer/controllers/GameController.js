// controllers/GameController.js
import { GameBoard } from "../models/GameBoard";
import { Direction, Order } from "../models/Direction";
import { Difficulty, BoardSize, PlaceWordLength } from "../models/GameConfigurartion.js";
import { Word } from "../models/Word";
import Player from "../models/Player";
import path from "path";
import fs from "fs/promises";
import Ranking from "../models/Ranking";
import SoundManager from "../models/SoundManager";
// =====================
// 이벤트 emitter
// =====================
class Emitter {
  constructor() { this.listeners = new Set(); }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(payload) { this.listeners.forEach(fn => fn(payload)); }
}

// =====================
// 랜덤 요소
// =====================
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// =====================
// GameController
// =====================
export class GameController {
  constructor() {
    this.board = new GameBoard();
    this.words = [];
    this.emitter = new Emitter();

    this.timerId = null;
    this.turnTimer = null;

    // 난이도
    this.initialGameDifficulty = Difficulty.VERYEASY;
    this.currentGameDifficulty = Difficulty.VERYEASY;

    // 보드 크기
    this.initialSize = BoardSize[this.initialGameDifficulty];
    this.currentSize = BoardSize[this.currentGameDifficulty];
    this.maxSize = 7;

    // 단어 길이
    this.initialWordLength = PlaceWordLength[this.initialGameDifficulty];
    this.currentWordLength = PlaceWordLength[this.currentGameDifficulty];

    // Player 인스턴스
    this.player1 = new Player("Player 1");
    this.player2 = new Player("Player 2");

    this.player1.setHP(5);
    this.player2.setHP(5);

    // UI state
    this.state = {
      timeIncreased: 0,
      turnActive: false,
      currentTurn: null,
      //boardInitialized: false,        // 🔹 보드 초기화 상태
      turnTime: 0,
      inputValue: "",
      player1: this.player1.getData(),
      player2: this.player2.getData(),
      grid: [],
      highlight: [],
      gameOver: false
    };

    this.gameStarted = false;
  }

  // =====================
  // React 구독 / 상태 업데이트
  // =====================
  subscribe(listener) {
    listener(this.state);
    return this.emitter.on(listener);
  }

  setState = (next) => {
    this.state = {...this.state, ...next};
    this.emitter.emit(this.state);
  }


  // =====================
  // 전체 게임 타이머
  // =====================
  mount() {
    this.timerId = setInterval(() => {
      if (!this.state.gameOver) {
        this.setState({ ...this.state, timeIncreased: this.state.timeIncreased + 1 });
      }
    }, 1000);
  }

  setPlayerInfo(playerKey, name, photo) {
    const player = this[playerKey];
    if (!player) return;
    if (name) player.setName(name);
    if (photo) player.setPhoto(photo);
    this.setState({ [playerKey]: player.getData() });
  }

  unmount() {
    if (this.timerId) clearInterval(this.timerId);
    if (this.turnTimer) clearInterval(this.turnTimer);
  }

  // =====================
  // 보드 초기화 및 새 게임
  // =====================
  async startInitialGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;

    this.currentSize = this.initialSize;
    this.currentWordLength = this.initialWordLength;
    this._resetRoundStates();

    this.board.resetBoard(this.currentSize, this.currentSize);

    const words = await this._pickWordsForSize(this.currentSize);
    console.log("difficulty:", this.currentGameDifficulty, "size:", this.currentSize, "words:", words);
    await this.newGame({ rows: this.currentSize, cols: this.currentSize, words });
  }

  async restartGame({ difficulty, player1: p1Data, player2: p2Data } = {}) {
    if (difficulty !== undefined) this.currentGameDifficulty = difficulty;
    if (this.currentGameDifficulty > Difficulty.VERYHARD) this.currentGameDifficulty = Difficulty.VERYHARD;

      // 🔹 기존 플레이어 상태 복원
  if (p1Data) {
    this.player1.setScore(p1Data.score);
    this.player1.setName(p1Data.name);
    //this.player1.setCombo(p1Data.combo);
    this.player1.setMaxCombo(p1Data.maxCombo);
    //this.player1.setHP(p1Data.hp);
  }
  if (p2Data) {
    this.player2.setScore(p2Data.score);
    this.player2.setName(p2Data.name);
    //this.player2.setCombo(p2Data.combo);
    this.player2.setMaxCombo(p2Data.maxCombo);
    //this.player2.setHP(p2Data.hp);
  }

    this.currentSize = BoardSize[this.currentGameDifficulty];
    this.currentWordLength = PlaceWordLength[this.currentGameDifficulty];

    this._resetRoundStates();
    const words = await this._pickWordsForSize(this.currentSize);
    console.log("difficulty:", this.currentGameDifficulty, "size:", this.currentSize, "words:", words);
    await this.newGame({ rows: this.currentSize, cols: this.currentSize, words });

      // 🔹 추가: gameOver false, 턴 상태 초기화
  this.setState({
    player1: this.player1.getData(),
    player2: this.player2.getData(),
    grid: this.board.grid,
    highlight: this.board.highlight,
    placedWordCheck: this.board.wordCheck,
    difficulty: this.currentGameDifficulty,
    gameOver: false,      // 반드시 false로 초기화
    turnActive: false,     // 턴 시작
    turnTime: 0,
    currentTurn: this.player1.getName(), // 첫 턴 플레이어
  });
  }

  _resetRoundStates() {
    this.player1.setCombo(0);
    this.player1.setHP(5);
    this.player2.setCombo(0);
    this.player2.setHP(5);

    this.setState({
      ...this.state,
      player1: this.player1.getData(),
      player2: this.player2.getData(),
      turnActive: false,
      turnTime: 0,
      currentTurn: null,
      inputValue: "",
      timeIncreased: 0
    });
  }

  async _pickWordsForSize(size) {
    let words = [];
    let fileName;
    switch (this.currentGameDifficulty) {
      case Difficulty.VERYEASY:
      case Difficulty.EASY: 
        fileName = "easy.txt"; 
        break;
      case Difficulty.NORMAL:
      case Difficulty.HARD: 
        fileName = "normal.txt"; 
        break;
      case Difficulty.VERYHARD: 
        fileName = "hard.txt";
        break;
      default: fileName = "easy.txt";
    }

    try {
      const filePath = path.join(process.cwd(), "src", "renderer", "assets", "wordLists", fileName);
      const data = await fs.readFile(filePath, "utf-8");
      const lines = data.split(/\r?\n/).filter(line => line.trim() !== "");
      words = lines.sort(() => 0.5 - Math.random()).slice(0, 5);
    } 
    catch (err) {
      console.error(fileName, "파일 읽기 실패", err);
    }
    return words;
  }

  async newGame({ rows, cols, words }) {
    this.board.resetBoard(rows, cols);
    this.words = this.board.placeWordsRandomly(words, Object.values(Direction), Object.values(Order), 1000);
    this.board.fillEmptyWithRandomLetters();
    
    let isChanged = true;
    while (isChanged) {
    isChanged = this.board.unintendedWordDelete(this.currentWordLength);
  }
    
    this.updateGridState();
}
  updateGridState() {
    const snapGrid = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;
    const deepGrid = snapGrid.map(row => [...row]);
    const deepHighlight = this.board.highlight.map(row => [...row]);
    this.setState({ ...this.state, grid: deepGrid, highlight: deepHighlight });
  }


  // =====================
  // 턴 관리
  // =====================
  startTurn(playerKey) {
    if (this.state.turnActive) return;
    const playerHP = playerKey === "player1" ? this.player1.getHP() : this.player2.getHP();
    if (playerHP <= 0) return;

    if (this.turnTimer) clearInterval(this.turnTimer);

    this.setState({ ...this.state, currentTurn: playerKey, turnActive: true, turnTime: 10, inputValue: "" });
    SoundManager.playLoop("gameClock");
    this.turnTimer = setInterval(() => {
      if (this.state.turnTime > 0) {
        //SoundManager.play("gameClock");
        this.setState({ ...this.state, turnTime: this.state.turnTime - 1 });
      } else {
        clearInterval(this.turnTimer);
        //SoundManager.stopBgm();
            // 현재 턴 플레이어 가져오기
          SoundManager.stop("gameClock");
            SoundManager.play("timeOver");
      const currentPlayerKey = this.state.currentTurn;
      if (currentPlayerKey) {
        const player = this[currentPlayerKey];
        //SoundManager.stopBgm();
        player.subHP();      // HP 감소
        player.setCombo(0);  // 콤보 초기화
      }
    this.setState({
      ...this.state,
      turnActive: false,
      turnTime: 0,
      player1: this.player1.getData(),
      player2: this.player2.getData()
    }); 
      }
    }, 1000);
    //SoundManager.stopBgm();
  }

  // =====================
  // 단어 입력 처리
  // =====================
  submitInput(wordRaw) {
    const guess = (wordRaw || "").trim().toLowerCase();
    if (!guess || !this.state.turnActive) return;

    const currentPlayerKey = this.state.currentTurn === "player1" ? "player1" : "player2";
    const opponentKey = currentPlayerKey === "player1" ? "player2" : "player1";

    const player = this[currentPlayerKey];
    const opponent = this[opponentKey];

    // 안전 체크
    const match = this.words.find(
      w => w && typeof w.isFound === "function" && typeof w.getText === "function" &&
           !w.isFound() && w.getText().toLowerCase() === guess
    );

    if (match) {
      match.markFoundWord();
      player.addCombo();
      player.addScore(100);
      opponent.subHP();
      opponent.setCombo(0);
      player.addWord(match);
      const playerIndex = currentPlayerKey === "player1" ? 0 : 1;
      SoundManager.playComboSound(player.getCombo())
      this.board.highlightWord(match, playerIndex);
      this.updateGridState();
      console.log("Correct word:", guess);
    } else {
      SoundManager.play("gameWrong");
      player.setCombo(0);
      player.subHP();
      player.addWord(match);
      console.log("Wrong word:", guess);
    }

    // 입력창 초기화 & UI 갱신
    this.setInputValue("");
    this.setState({
      ...this.state,
      player1: this.player1.getData(),
      player2: this.player2.getData()
    });

    // 턴 종료
    SoundManager.stop("gameClock");
    this.endTurn();
  }

  endTurn() {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
      this.turnTimer = null;
    }
    SoundManager.stop("gameClock");
    const allWordsFound = this.words.every(w => w && typeof w.isFound === "function" && w.isFound());
    const playersDead = this.player1.getHP() <= 0 && this.player2.getHP() <= 0;

    if (allWordsFound || playersDead) {
      console.log("Game Over!");
      Ranking.load();
      Ranking.add(this.player1.getName(), this.player1.getScore());
      Ranking.add(this.player2.getName(), this.player2.getScore());
      Ranking.save();

      
      // 최근 승자 기록 (rankingview 쪽 기능)
      localStorage.setItem("lastWinners", JSON.stringify([
        this.player1.getName(),
        this.player2.getName()
      ]));


      setTimeout(() => {
      this.setState({ 
        ...this.state,
        player1: this.player1.getData(),
        player2: this.player2.getData(),
        grid: this.board.grid,                  // ✅ 보드 상태 전달
        highlight: this.board.highlight,        // ✅ 하이라이트 전달
        placedWordCheck: this.board.placedWordCheck,  // ✅ 못맞춘 단어 체크 전달
        difficulty: this.currentGameDifficulty,
        gameOver: true 
      });
    }, 2000);
    }

    // 턴 초기화
    this.setState({
      ...this.state,
      player1: this.player1.getData(),
      player2: this.player2.getData(),
      turnActive: false,
      turnTime: 0,
      currentTurn: null
    });
// =======
//     // =====================
//     // 게임 종료 조건(랭킹변경)
//     // =====================
//     const allWordsFound = this.words.every((w) => w.isFound && w.isFound());
//     if (nextState.player1.hp <= 0 && nextState.player2.hp <= 0) {
//     Ranking.load();
//     Ranking.add(nextState.player1.getName(), nextState.player1.getScore());
//     Ranking.add(nextState.player2.getName(), nextState.player2.getScore());
//     Ranking.save();

//     localStorage.setItem("lastWinners", JSON.stringifty([
//       nextState.player1.getName(),
//       nextState.player2.getName()
//     ]));

//     setTimeout(() => {
//       this.setState({ ...nextState, gameOver: true });
//     }, 2000);
//   } else if (allWordsFound) {
//     Ranking.load();
//     Ranking.add(nextState.player1.getName(), nextState.player1.getScore());
//     Ranking.add(nextState.player2.getName(), nextState.player2.getScore());
//     Ranking.save();

//     setTimeout(() => {
//       this.setState({ ...nextState, gameOver: true });
//     }, 2000);
//   } else {
//     this.setState(nextState);
//   }
// >>>>>>> origin/rankingview
  }

  setInputValue(value) {
    this.setState({ ...this.state, inputValue: value.toUpperCase() });
  }
}