import { Direction,Order } from "./Direction";

export class Word {
  constructor(text) {
    this.text = text;
    this.startX = 10;
    this.startY = 10;
    this.direction = Direction.HORIZONTAL;
    this.order = Order.FORWARD;
    this.found = false;
  }
  setPosition(x, y, direction) {
    this.startX = x;
    this.startY = y;
    this.direction = direction;
  }

  static reverseWord(text) { // 단어 뒤집기 , 단어 거꾸로 배치시 필요
    return text.split("").reverse().join("");
}

  markFoundWord() { this.found = true; }

  getText() { return this.text.toLowerCase(); } 
  getX() { return this.startX; }
  getY() { return this.startY; }
  getDirection() { return this.direction; }
  getOrder() { return this.order; }
  isFound() { return this.found; }
}