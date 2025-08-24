import { Word } from "./Word";
import { DX, DY, Order } from "./Direction";

export class GameBoard {
  constructor() {
    this.row = 10;
    this.col = 10;
    this.grid = []; // 단어보드
    this.placedWordCheck = []; // 배치된 단어들 체크용
    this.highlight = []; // 정답단어 체크용 
    this.setSize(10, 10);
  }

  setSize(row, col) {
    if (row < 5 || row > 10) row = 10;
    if (col < 5 || col > 10) col = 10;
    this.row = row;
    this.col = col;
    this.grid = Array.from({ length: row }, () => Array(col).fill("*"));
    this.placedWordCheck = Array.from({ length: row }, () => Array(col).fill(false));
    this.highlight = Array.from({ length: row }, () => Array(col).fill(false));
  }

  getRow() { return this.row; }
  getCol() { return this.col; }
  getCharAt(y, x) { return this.grid[y][x]; }
  isHighlighted(y, x) { return this.highlight[y][x]; }

  clear() {
    if (!this.grid.length || !this.highlight.length) return;
    for (let y = 0; y < this.row; y++) {
      for (let x = 0; x < this.col; x++) {
        this.grid[y][x] = "*";
        this.highlight[y][x] = false;
        this.placedWordCheck[y][x] = false;
      }
    }
  }

  canPlaceWord(word) {
    const dir = word.getDirection();
    const ord = word.order;
    const x = word.getX();
    const y = word.getY();
    const text = word.getText();

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
    for (let i = 0; i < text.length; i++) {
      const wordX = x + DX[direction] * i;
      const wordY = y + DY[direction] * i;
      this.grid[wordY][wordX] = text[i];
    }
  }

  highlightWord(word) {
    const text = word.getText();
    const dir = word.getDirection();
    const x = word.getX();
    const y = word.getY();
    for (let i = 0; i < text.length; i++) {
      const wordX = x + DX[dir] * i;
      const wordY = y + DY[dir] * i;
      this.grid[wordY][wordX] = text[i].toUpperCase();
      this.highlight[wordY][wordX] = true;
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
        w.setPosition(x, y, dir);
        if (this.canPlaceWord(w)) {
          this.placeWord(text.toLowerCase(), x, y, dir, ord);
          placedWords.push(w);
          placed = true;
        }
      }
    }
    return placedWords;
}

fillEmptyWithRandomLetters() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < this.grid.length; r++) {
        for (let c = 0; c < this.grid[r].length; c++) {
            if (!this.grid[r][c] || this.grid[r][c] === "*") {
                this.grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

setBoardSize(rows, cols) {
    this.setSize(rows, cols);
    this.clear();
}
}