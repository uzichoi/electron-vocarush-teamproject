// models/Word.js
export class Word {
  constructor(text) {
    this.text = text;
    this.startX = 0;
    this.startY = 0;
    this.direction = "HORIZONTAL";
    this.found = false;
  }

  setPosition(x, y, direction) {
    this.startX = x;
    this.startY = y;
    this.direction = direction;
  }

  getText() {
    return this.text;
  }

  getX() {
    return this.startX;
  }

  getY() {
    return this.startY;
  }

  getDirection() {
    return this.direction;
  }

  isFound() {
    return this.found;
  }

  markFoundWord() {
    this.found = true;
  }
}
