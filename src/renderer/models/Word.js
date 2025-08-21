import { Direction } from "./Direction";

export class Word {
  constructor(text) {
    this.text = text;
    this.startX = 10;
    this.startY = 10;
    this.direction = Direction.HORIZONTAL;
    this.found = false;
  }
  setPosition(x, y, direction) {
    this.startX = x;
    this.startY = y;
    this.direction = direction;
  }
  markFoundWord() { this.found = true; }

  getText() { return this.text; }
  getX() { return this.startX; }
  getY() { return this.startY; }
  getDirection() { return this.direction; }
  isFound() { return this.found; }
}