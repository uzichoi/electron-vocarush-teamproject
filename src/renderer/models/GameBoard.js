import { DX, DY } from "./Direction";

export class GameBoard {
  constructor() {
    this.row = 10;
    this.col = 10;
    this.grid = [];
    this.highlight = [];
    this.setSize(10, 10);
  }

  setSize(row, col) {
    if (row < 5 || row > 10) row = 10;
    if (col < 5 || col > 10) col = 10;
    this.row = row;
    this.col = col;
    this.grid = Array.from({ length: row }, () => Array(col).fill("*"));
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
      }
    }
  }

  canPlaceWord(word) {
    const dir = word.getDirection();
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

  placeWord(text, x, y, direction) {
    if (/^[A-Z]/.test(text[0])) text = text[0].toLowerCase() + text.slice(1);
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
}