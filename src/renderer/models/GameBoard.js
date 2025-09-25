// moddls/GameBoard.js

import { Word } from "./Word";
import { DX, DY, Order } from "./Direction";
import { Difficulty } from "./GameConfiguration";

export class GameBoard {
  constructor() {

    this.row = 4;
    this.col = 4;
    this.grid = []; // 단어보드
    this.placedWordCheck = []; // 배치된 단어들 체크용
    this.highlight = []; // 정답단어 체크용 
    this.placeWordLength = 5; // 현재 난이도 배치 단어 길이
    this.words = new Set(); // 사전 단어들 (의도하지않은 단어 제거용)
    this.placedWords = []; //실제 배치된 단어들
    this.hiddenWord = null; //히든 워드 저장
    this.setSize(4, 4); 
  }

  setSize(row, col) {
    // 최소 4, 최대 6 보장
    if (row < 4) row = 4;
    if (row > 6) row = 6;
    if (col < 4) col = 4;
    if (col > 6) col = 6;

    this.row = row;
    this.col = col;

    this.grid = Array.from({ length: row }, () => Array(col).fill("*"));
    this.placedWordCheck = Array.from({ length: row }, () => Array(col).fill(false));
    this.highlight = Array.from({ length: row }, () => Array(col).fill(false)); // 나중에 true / false 말고 플레이어 구분 할수있도록 (플레이어가 각각 맞춘 단어 색 다르게)
  }

  getRow() { return this.row; }
  getCol() { return this.col; }
  getCharAt(y, x) { return this.grid[y][x]; }
  isHighlighted(y, x) { return this.highlight[y][x]; }

  getPlacedWordsCount() {
    return this.placedWords ? this.placedWords.length : 0;
  }

  getPlacedWords(){
    return this.placedWords;
  }

  getHiddenWord() {
    return this.hiddenWord;
  }

  isHiddenWord(word) {
    return this.hiddenWord && this.hiddenWord.getText().toLowerCase() === word.toLowerCase();
  }

  clear() {
    if (!this.grid.length || !this.highlight.length) return;
    for (let y = 0; y < this.row; y++) {
      for (let x = 0; x < this.col; x++) {
        this.grid[y][x] = "*";
        this.highlight[y][x] = -1; // -1은 하이라이트 없음
        this.placedWordCheck[y][x] = false;
      }
    }
    this.placedWords = [];
    this.hiddenWord = null;
  }

  canPlaceWord(word) {
    const dir = word.getDirection();
    const ord = word.order;
    const x = word.getX();
    const y = word.getY();
    let text = word.getText();

    if (ord === Order.BACKWARD) text = Word.reverseWord(text); // 단어 역방향 배치시

    for (let i = 0; i < text.length; i++) {
      const wordX = x + DX[dir] * i;
      const wordY = y + DY[dir] * i;
      if (wordY < 0 || wordY >= this.row || wordX < 0 || wordX >= this.col) return false;
      const current = this.grid[wordY][wordX];
      const needed = text[i];
      if (current !== "*" && current !== needed) return false;
    }
    return true;
  }

  placeWord(text, x, y, direction, order) {
    if (/^[A-Z]/.test(text[0])) text = text[0].toLowerCase() + text.slice(1); // if 첫글자 대문자면 -> 소문자
    if (order === Order.BACKWARD) text = Word.reverseWord(text); // 단어 역방향 배치시
    
    const coords = [];

    for (let i = 0; i < text.length; i++) {
      const wordX = x + DX[direction] * i;
      const wordY = y + DY[direction] * i;
      this.grid[wordY][wordX] = text[i];
      this.placedWordCheck[wordY][wordX] = true; // 단어가 배치된 위치 체크
      
      coords.push([wordY, wordX]);
    }
    this.placedWords.push({ text, coords, direction, order });
  }

  highlightWord(word, playerIndex) {
  let text = word.getText();
  const dir = word.getDirection();
  const x = word.getX();
  const y = word.getY();
  const ord = word.order;

  if (ord === Order.BACKWARD) text = Word.reverseWord(text); // 단어 역방향 배치시

  for (let i = 0; i < text.length; i++) {
    const wordX = x + DX[dir] * i;
    const wordY = y + DY[dir] * i;
    this.grid[wordY][wordX] = text[i];
    this.highlight[wordY][wordX] = playerIndex;
  }
  }

  getGridSnapshot() {
    return this.grid.map(row => row.slice());
  }

  resetBoard(rows, cols) {
    this.setSize(rows, cols);
    this.clear();
}

placeWordsRandomly(words, directions,orders, maxTries) {
    const placedWords = [];
    for (const text of words) {
      let placed = false;
      for (let tries = 0; tries < maxTries && !placed; tries++) {
        const x = Math.floor(Math.random() * this.col);
        const y = Math.floor(Math.random() * this.row);
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const ord = orders[Math.floor(Math.random() * orders.length)];
        const w = new Word(text.toLowerCase());
        w.order = ord;
        w.setPosition(x, y, dir);
        if (this.canPlaceWord(w)) {
          this.placeWord(text.toLowerCase(), x, y, dir, ord);
          placedWords.push(w);
          console.log(w.getText(), "order:", w.order);
          placed = true;
        }
      }
    }

    this.placedWords = placedWords;

    // 히든 워드 선택 (배치된 단어 중 랜덤으로 1개)
    if (placedWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * placedWords.length);
      this.hiddenWord = placedWords[randomIndex];
      console.log("Hidden word selected:", this.hiddenWord.getText());
    }
    return placedWords;
  }

  fillEmptyWithRandomLetters() {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    for (let r = 0; r < this.grid.length; r++) {
        for (let c = 0; c < this.grid[r].length; c++) {
            if (!this.grid[r][c] || this.grid[r][c] === "*") {
                this.grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
  }

  unintendedWordDelete(PlaceWordLength) {
    const dirRow = [0, 0, 1, -1, 1, -1, -1, 1];
    const dirCol = [1, -1, 0, 0, 1, -1, 1, -1];
    //  { ->, <-, 아래, 위, 오른쪽 아래 대각선, 왼쪽 위 대각선, 오른쪽 위 대각선, 왼쪽 아래 대각선 }
    //console.log("call u-i-w-d");
    const Grid = this.grid;                 // 2차원 배열 (문자)
    const placedWordBoard = this.placedWordCheck; // 의도된 단어 위치 (true/false)

    const Row = this.row;
    const Col = this.col;
    //const PlaceWordLength = this.placeWordLength;

    let changed = false;
    //console.log("row:", Row, "col:", Col, "PlaceWordLength:", PlaceWordLength);
    for (let row = 0; row < Row; row++) {
      for (let col = 0; col < Col; col++) {
        for (let dir = 0; dir < 8; dir++) {
          let stR = row;
          let stC = col;

          let word = "";
          let pos = [];

          for (let wordLen = 0; wordLen < PlaceWordLength; wordLen++) {
            
            if (stC < 0 || stC >= Col || stR < 0 || stR >= Row) break;
            word += Grid[stR][stC];
            pos.push([stR, stC]);
            stR += dirRow[dir];
            stC += dirCol[dir];
          }

          // console.log(
          //   "단어:", word,
          //   "| hasExact:", this.words.has(word),
          //   "| hasLower:", this.words.has(word.toLowerCase())
          // );

          if (word.length === PlaceWordLength && this.words.has(word.toLowerCase())) {
            // 단어가 전부 의도된 칸인지 확인
            //console.log("단어 존재", word);
            let isIntended = true;
            for (let [r, c] of pos) {
              if (!placedWordBoard[r][c]) { // false = 의도 안됨
                isIntended = false;
                console.log("의도되지 않은 단어 발견:", word); // 디버그용
                break;
              }
            }

            // 의도되지 않은 단어라면 → 끝 글자부터 'q'로 덮기
            if (!isIntended) {
              for (let i = PlaceWordLength - 1; i >= 0; i--) {
                let [r, c] = pos[i];
                if (!placedWordBoard[r][c]) {
                  Grid[r][c] = 'q';
                  changed = true;
                  break; // 한 글자만 변경
                }
              }
            }
          }
        }
      }
    }

    return changed;
  }

  /*
  async fileRead() {
    try {
      const filePath = path.resolve('src/renderer/assets/wordLists/words.txt');
      const data = await fs.readFile(filePath, 'utf-8');
      const lines = data.split(/\r?\n/);
      
      for (let line of lines) {
        const clean = line.trim().toLowerCase();
        if (clean) {
          this.words.add(clean);
          // 디버그용
          // console.log("단어 추가됨:", JSON.stringify(clean));
        }
      }

      //console.log("사전 단어 개수:", this.words.size);
    } catch (err) {
      console.error("file open fail", err);
    }
  }
  */
/*
 async fileRead() {
    try {
      const wordListPath = await window.electronAPI.getWordListPath("words");
      const wordData = await window.electronAPI.readWordsFile("words");

      // const filePath = path.join(process.cwd(), "words.txt"); // 프로젝트 루트 기준
      // const data = await fs.readFile(filePath, "utf-8");

      const lines = wordData.split(/\r?\n/);
      for (let line of lines) {
        if (line.trim() !== "") {
          this.words.add(line.trim());
        }
      }
    } catch (err) {
      console.error("file open fail", err);
    }
  }*/

async fileRead() {
  try {
    // wordListPath를 읽는 부분은 이미 처리했으므로, 파일을 읽는 부분은 wordData로 처리
    const wordData = await window.electronAPI.readWordsFile("words");

    // wordData가 반환된 객체인지 확인
    // console.log("wordData:", wordData);
    // 객체로 반환되는 것 확인

    // 파일을 성공적으로 읽었다면, 단어 리스트를 처리. 이때 wordData 객체의 'words' 속성에 접근하여 처리한다.
    if (wordData.ok && typeof wordData.words === "string") {
      //const lines = wordData.words.split(/\r?\n/);  // wordData.words에 실제 단어 데이터가 담겨있음
      const lines = wordData.words.split(/\r?\n/).map(line => line.trim()).filter(line => line !== "");


      for (let line of lines) {
        if (line.trim() !== "") {
          this.words.add(line.trim());  // 빈 줄을 제외하고 단어를 추가
        }
      }
      console.log("단어 개수:", this.words.size);  // 단어가 제대로 추가되었는지 확인
    } else {
      console.error("Error reading file:", wordData.error);
    }
  } catch (err) {
    console.error("File open failed", err);
  }
}

setBoardSize(rows, cols) {
    this.setSize(rows, cols);
    this.clear();
  }
}
