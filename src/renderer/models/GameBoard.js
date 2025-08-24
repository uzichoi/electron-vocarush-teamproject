// models/GameBoard.js

import { Direction } from "./Direction.js";

export class GameBoard {
  constructor() {
    this.rows = 10;
    this.cols = 10;
    this.grid = [];
    this.highlighted = [];
    this.#initializeBoard();
  }

  // 보드 초기화 (private method)
  #initializeBoard() {
    this.grid = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill("*")
    );
    this.highlighted = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(false)
    );
  }

  // 보드 크기 설정
  setSize(rows, cols) {
    // 입력값 검증 및 기본값 설정
    this.rows = (rows >= 5 && rows <= 10) ? rows : 10;
    this.cols = (cols >= 5 && cols <= 10) ? cols : 10;
    
    this.#initializeBoard();
  }

  // 보드 초기화
  clear() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = "*";
        this.highlighted[row][col] = false;
      }
    }
  }

  // 좌표가 보드 범위 내인지 확인
  _isValidPosition(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  // 단어를 배치할 수 있는지 확인
  canPlaceWord(word) {
    if (!word) return false;
    
    const directionName = word.getDirection();
    const direction = Direction[directionName];
    
    if (!direction) {
      console.warn(`Unknown direction: ${directionName}`);
      return false;
    }

    const { dx, dy } = direction;
    const text = word.getText().toLowerCase();
    const startRow = word.getY(); // Word의 Y는 실제로 행(row)
    const startCol = word.getX(); // Word의 X는 실제로 열(col)

    // 각 글자 위치 검사
    for (let i = 0; i < text.length; i++) {
      const currentRow = startRow + dy * i;
      const currentCol = startCol + dx * i;

      // 경계 검사
      if (!this._isValidPosition(currentRow, currentCol)) {
        return false;
      }

      // 기존 글자와의 충돌 검사
      const existingChar = this.grid[currentRow][currentCol];
      const requiredChar = text[i];
      
      if (existingChar !== "*" && existingChar !== requiredChar) {
        return false;
      }
    }

    return true;
  }

  // 단어를 보드에 배치
  placeWord(text, startCol, startRow, directionName) {
    if (!text) return false;
    
    const direction = Direction[directionName];
    if (!direction) {
      console.warn(`Unknown direction: ${directionName}`);
      return false;
    }

    const { dx, dy } = direction;
    const lowerText = text.toLowerCase();

    // 배치 가능한지 먼저 확인
    for (let i = 0; i < lowerText.length; i++) {
      const currentRow = startRow + dy * i;
      const currentCol = startCol + dx * i;
      
      if (!this._isValidPosition(currentRow, currentCol)) {
        console.warn(`Cannot place word: position out of bounds`);
        return false;
      }
    }

    // 실제 배치
    for (let i = 0; i < lowerText.length; i++) {
      const currentRow = startRow + dy * i;
      const currentCol = startCol + dx * i;
      this.grid[currentRow][currentCol] = lowerText[i];
    }

    return true;
  }

  // 찾은 단어를 하이라이트
  highlightWord(word) {
    if (!word) return false;
    
    const directionName = word.getDirection();
    const direction = Direction[directionName];
    
    if (!direction) {
      console.warn(`Unknown direction: ${directionName}`);
      return false;
    }

    const { dx, dy } = direction;
    const text = word.getText();
    const startRow = word.getY();
    const startCol = word.getX();

    // 하이라이트 적용
    for (let i = 0; i < text.length; i++) {
      const currentRow = startRow + dy * i;
      const currentCol = startCol + dx * i;
      
      if (this._isValidPosition(currentRow, currentCol)) {
        this.grid[currentRow][currentCol] = text[i].toUpperCase();
        this.highlighted[currentRow][currentCol] = true;
      }
    }

    return true;
  }

  // 특정 위치가 하이라이트되어 있는지 확인
  isHighlighted(row, col) {
    if (!this._isValidPosition(row, col)) {
      return false;
    }
    return this.highlighted[row][col];
  }

  // 특정 위치의 문자 반환
  getCharAt(row, col) {
    if (!this._isValidPosition(row, col)) {
      return null;
    }
    return this.grid[row][col];
  }

  // 보드 크기 정보 반환
  getSize() {
    return { rows: this.rows, cols: this.cols };
  }

  // 전체 그리드 복사본 반환 (외부에서 직접 수정 방지)
  getGrid() {
    return this.grid.map(row => [...row]);
  }

  // 전체 하이라이트 상태 복사본 반환
  getHighlighted() {
    return this.highlighted.map(row => [...row]);
  }

  // 보드 상태 출력 (디버깅용)
  printBoard() {
    console.log("Current board state:");
    this.grid.forEach((row, i) => {
      console.log(`${i}: ${row.join(" ")}`);
    });
  }
}