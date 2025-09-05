// controllers/GameController.js

import { GameBoard } from "../models/GameBoard";
import { Direction, Order } from "../models/Direction";
import { Difficulty, BoardSize, PlaceWordLength } from "../models/GameConfigurartion.js";
import { Word } from "../models/Word";
import Player from "../models/Player";
import path from "path";
import fs from "fs/promises";



class Emitter { // 이벤트 발생기
  constructor() { this.listeners = new Set(); } // Set은 중복 없는 자료구조. forEach로 모든 listener 실행
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }    // 구독자 추가, 해제 함수 반환
  emit(payload) { this.listeners.forEach(fn => fn(payload)); }  // 모든 구독자 호출
}


function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }  // 배열에서 랜덤으로 하나 추출

export class GameController {   // 게임 상태와 진행을 총괄화는 클래스
  constructor() { // 객체 생성 시 실행. 생성자
   this.board = new GameBoard();
    this.words = [];
    this.emitter = new Emitter();

    this.timerId = null;     // 전체 타이머
    this.turnTimer = null;   // 턴 타이머

    const difficulty = Object.values(Difficulty);

    // 난이도
    this.initialGameDifficulty = Difficulty.VERYEASY; // 초기 난이도 (0)
    this.currentGameDifficulty = Difficulty.VERYEASY; // 현재 난이도 (0)

    // 보드크기
    this.initialSize = BoardSize[this.initialGameDifficulty]; // 초기 보드 크기
    this.currentSize = BoardSize[this.currentGameDifficulty]; // 현재 보드 크기
    this.maxSize = 7; // 최대 보드 크기
    
    // 단어 길이
    this.initialwordLength  = PlaceWordLength[this.initialGameDifficulty]; // 초기 단어 길이
    this.currentWordLength = PlaceWordLength[this.currentGameDifficulty]; // 현재 단어 길이

     // ✅ Player 인스턴스를 state 밖으로 분리
    this.player1 = new Player("player1"),
    this.player2 = new Player("player2"),
    this.player1.setName("Player 1");
    this.player2.setName("Player 2");
    this.player1.setHP(5);
    this.player2.setHP(5);

      // React와 연결되는 순수 데이터만 state에 저장
    this.state = {
      timeIncreased: 0,
      turnActive: false,
      currentTurn: null,
      turnTime: 0,
      inputValue: "",
      player1: this.player1.getData(), // plain object 형태
      player2: this.player2.getData(),
      grid: [],
      gameOver: false //게임 종료 상태
    };
       this.gameStarted = false; // <- 추가
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


//   newGame(opts) {
//     const { rows, cols, words } = opts;
//     this.board.resetBoard(rows, cols);
//     this.words = [];
//     const directions = Object.values(Direction);
//     const orders = Object.values(Order);
//     this.words = this.board.placeWordsRandomly(words, directions, orders, 200);
// 
//       const next = Math.min(300, this.state.timeIncreased + 1);   // 1초마다 timeIncreased+1하되, 최대 300
//       this.setState({ ...this.state, timeIncreased: next });
//     }, 1000);
//   }



// 초기 게임 시작
async startInitialGame() {  // 비동기 함수로 선언. 해당 함수는 무조건 Promise를 반환한다.
    if (this.gameStarted) return;   // 이미 시작했으면 무시
    this.gameStarted = true;

  console.log("Difficulty:", this.currentGameDifficulty, "Size:", this.currentSize);
    this.currentSize = this.initialSize;
    this._resetRoundStates();

    // 1) 보드 크기 명시적 초기화
    this.board.resetBoard(this.currentSize, this.currentSize);

    // 2) 단어 선택 (5개)
    const words = await this._pickWordsForSize(this.currentSize);  

    // 3) 새 게임 시작
    await this.newGame({ rows: this.currentSize, cols: this.currentSize, words });    
}



// 게임 재시작
async restartGame({ difficulty } = {}) { // 게임 난이도가 올라갈 때마다 호출 (보드크기, 글자크기 변경)

    //console.log("Difficulty:", this.currentGameDifficulty, "Size:", this.currentSize);
    if (difficulty !== undefined) { // 🔧 undefined 체크
    this.currentGameDifficulty = difficulty; 
    }
    if (this.currentGameDifficulty == Difficulty.VERYHARD) this.currentGameDifficulty = Difficulty.VERYHARD;   // 최대 난이도를 VERYHARD로 제한

    this.currentSize = BoardSize[this.currentGameDifficulty];
    this.currentWordLength = PlaceWordLength[this.currentGameDifficulty];

    this._resetRoundStates();   // 라운드별 상태 리셋
    const words = await this._pickWordsForSize(this.currentSize);   // 새 단어 5개 뽑을 때까지 기다린 후,
    await this.newGame({ rows: this.currentSize, cols: this.currentSize, words });  // newGame() 실행

    // grid 스냅샷(현재 보드의 고정된 상태 복사본) 저장 후 state 업데이트 (플레이어 상태도 초기화)
    const snap = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;  // 그리드 스냅샷이 존재하면 그대로 사용, 없으면 보드 그리드 사용
   
    console.log("Difficulty:", this.currentGameDifficulty, "Size:", this.currentSize);
   this.setState({  // 보드 상태 반영
        ...this.state,
        currentGameDifficulty: this.currentGameDifficulty,
        currentSize: this.currentSize,
        currentWordLength: this.currentWordLength,
        grid: snap,   // 보드 상태를 UI에 반영 -> 화면 갱신  
        inputValue: "",
        player1: { ...this.player1.getData(), combo: 0, maxCombo: 0, hp: 5 },
        player2: { ...this.player2.getData(), combo: 0, maxCombo: 0, hp: 5 },
        timeIncreased: 0
    });
  }


  
  // 보드 상태 반영 (깊은 복사)
  // 보드가 바뀔 때마다 상태를 반영해야 안전함
 updateGridState() {
  // grid 깊은 복사
  const snapGrid = this.board.getGridSnapshot ? this.board.getGridSnapshot() : this.board.grid;
  const deepGrid = snapGrid.map(row => [...row]);

  // highlight 깊은 복사
  const deepHighlight = this.board.highlight.map(row => [...row]);

  // state에 grid와 highlight 동시에 반영
  this.setState({
    ...this.state,
    grid: deepGrid,
    highlight: deepHighlight
  });
}

   // 라운드 상태 초기화
  _resetRoundStates() {
    // 새로운 라운드가 시작될 때, 점수는 유지하면스ㅓ 콤보/체력/입력값 초기화. 추후 변동 가능성
    const p1 = { ...this.player1.getData(), combo: 0, maxCombo: 0, hp: 5 /*, score: 0*/ };
    const p2 = { ...this.player2.getData(), combo: 0, maxCombo: 0, hp: 5 /*, score: 0*/ };
    this.setState({ ...this.state, player1: p1, player2: p2, timeIncreased: 0, inputValue: "" }); 
  }

  // 단어 추출
  async _pickWordsForSize(size) {
    // 보드 크기에 따라 단어 난이도/개수를 조정하고 싶으면 여기서 결정
    // 지금은 예시로 동일하게 사용
 let words = [];

    // 난이도별 파일명 매핑
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
        default:
            fileName = "easy.txt";
    }

        try {
          const filePath = path.join(process.cwd(), fileName); // 프로젝트 루트 경로 + 파일명
          const data = await fs.readFile(filePath, "utf-8");  // 파일 비동기 읽기
          const lines = data.split(/\r?\n/).filter(line => line.trim() !== ""); // 줄 단위 분리

        // lines에서 랜덤으로 5개 선택
        const shuffled = lines.sort(() => 0.5 - Math.random()); // 단어 배열 셔플
        words = shuffled.slice(0, 5).map(line => line.trim());  // 앞에서부터 5개 추출
        } 
        catch (err) {
          console.error(fileName, ": Failed to open file", err);
        }

    return words;
  }

 
  // 새 게임: 보드 초기화 + 단어 랜덤 배치 + 빈칸 채우기 + 상태 반영
  async newGame(opts = { rows:10, cols: 10, words: ["about","korea","apple","storm","logic"] }) { // 디폴트 매개 변수
    const { rows, cols, words } = opts;

    this.board = new GameBoard();  // 새로운 보드 객체 생성
    // 1) 보드 리셋
    this.board.resetBoard(rows, cols);
    this.words = [];
    
    console.log("New Game with size:", rows, cols, "and words:", words);

    // 2) 단어 랜덤 배치
    const directions = Object.values(Direction); // Direction은 {HORIZONTAL:..., VERTICAL:..., ...} 형태라고 가정
    const orders = Object.values(Order);
    this.words = this.board.placeWordsRandomly(words,directions,orders, 1000)

    
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
  // setInputValue(v) {
  //   this.setState({ ...this.state, inputValue: v });
  // }

  // board APIs
  setBoardSize(row, col) {
    this.board.setBoardSize(row, col);
     this.updateGridState();
  }
  
  nextRound = async () => {
        await this.restartGame(); // 난이도 + 보드 재설정
    };
    

/*
  submitInput(wordRaw, playerTurn = 0) {
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

    const match = this.words.find(w => !w.isFound() && w.getText() === guess); // 유지
    
    //  const playerKey = playerIndex === 0 ? "player1" : "player2"; //유지
    // const player = { ...this.state[playerKey] };
    // let playerIndex = 0; // 임시 (하이라이트 확인용)
    // if (match) {
    //   match.markFoundWord();
    //   this.board.highlightWord(match, playerIndex); // 플레이어 인덱스 전달 (0 또는 1) 정답 단어 플레이어별 구분
    //   this.updateGridState();

      //const p1 = { ...this.state.player1 };
//       player.combo += 1;
//       player.maxCombo = Math.max(player.maxCombo, player.combo);
//       player.score += 100;


    if (this.state.currentTurn === "player1") {
      this.state.player1.addWord(isCorrect);//통계반영
      if (isCorrect) {
        this.state.player1.addCombo();
        this.state.player1.addScore(100);
        this.state.player2.subHP();
        this.state.player2.setCombo(0);
        match.markFoundWord();
        this.board.highlightWord(match, 0); // 플레이어 인덱스 전달 (0 또는 1) 정답 단어 플레이어별 구분
        this.updateGridState();
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
        match.markFoundWord();
        this.board.highlightWord(match, 1); // 플레이어 인덱스 전달 (0 또는 1) 정답 단어 플레이어별 구분
        this.updateGridState();
      } else {
        this.state.player2.setCombo(0);
        this.state.player2.subHP();
        }
    }
*/

submitInput(wordRaw) {
  const guess = (wordRaw || "").trim().toLowerCase();
  if (!guess || !this.state.turnActive) return;

  const nextState = { ...this.state };
  // const match = this.words.find(
  //   (w) => !w.isFound() && w.getText().toLowerCase() === guess
  // );
  const match = this.words.find(w => !w.isFound?.() && w.getText?.().toLowerCase() === guess); // 🔧 isFound() 함수 체크
  
  const player = this.state.currentTurn === "player1" ? this.player1 : this.player2;
  const opponent = this.state.currentTurn === "player1" ? this.player2 : this.player1;

  if (!match) {
    // 틀린 단어 처리
    //if (this.state.currentTurn === "player1") {
    console.log("Wrong word:", guess);
      player.setCombo(0);
      player.subHP();

      this.setState({
        ...nextState,
        player1: this.player1.getData(),
        player2: this.player2.getData()
      });
    //} 
    //else {
      // this.state.player2.setCombo(0);
      // this.state.player2.subHP();
    //}
  } else {
    // 맞춘 단어 처리
    console.log("Correct word:", guess);
    match.markFoundWord();

    player.addWord(true);
    player.addCombo();
    player.addScore(100);

    opponent.subHP();
    opponent.setCombo(0);

    // 보드 하이라이트
    const playerIndex = this.state.currentTurn === "player1" ? 0 : 1;
    this.board.highlightWord(match, playerIndex);
    this.updateGridState();

    this.setState({
      ...nextState,
      player1: this.player1.getData(),
      player2: this.player2.getData()
    });
  }

    // 턴 종료
    nextState.inputValue = "";
    nextState.turnActive = false;
    nextState.turnTime = 0;
    if (this.turnTimer) clearInterval(this.turnTimer);

    // 게임 종료 조건
    //const allWordsFound = this.words.every((w) => w.isFound && w.isFound());
    const allWordsFound = this.words.every((w) => w.isFound?.()); // 🔧 isFound() 호출    
    if (this.player1.getHP() <= 0 && this.player2.getHP() <= 0) {
      setTimeout(() => {
      this.setState({
        ...nextState,
        player1: this.state.player1,  // ✅ Player 인스턴스 유지
        player2: this.state.player2,
        gameOver: true,
      });
    }, 2000);  // 2초 후 종료
    } else if (allWordsFound) {
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
  // if (match) {
  //   match.markFoundWord?.();
  //   const coords = match.getCoords?.();

  //   if (coords) {
  //     const updatedGrid = this.state.grid.map((row, i) =>
  //       row.map((cell, j) =>
  //         coords.some(([x, y]) => x === i && y === j)
  //           ? cell.toUpperCase()
  //           : cell
  //       )
  //     );
  //     this.setState({ ...this.state, grid: updatedGrid });
  //   }
  //   return true;
  // }
  return false;


  //     this.setState({ ...this.state, [playerKey]: player, inputValue: "", grid: deep });
  //   } else {
  //     //const p1 = { ...this.state.player1 };
  //     player.combo = 0;
  //     player.hp = Math.max(0, player.hp - 1);
  //     this.setState({ ...this.state, [playerKey]: player, inputValue: "" });
  //   }
  }

  // 사용자가 입력 중인 단어를 state에 저장. 대문자 변환 후 보관
  setInputValue(v) { this.setState({ ...this.state, inputValue: v.toUpperCase() }); }

  // 초기 랜덤 생성은 사용하지 않음 (newGame에서 처리)
  //generateInitialGrid() { return []; }

  // 상태 업데이트
  //setState(next) { this.state = next; this.emitter.emit(this.state); }

  // =====================
  // setState (화살표 함수로 수정!)
  // =====================
  setState = (next) => {
    this.state = next;
    this.emitter.emit(this.state);
  }

}





//export const gameController = new GameController();