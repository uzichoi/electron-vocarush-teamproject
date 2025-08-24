export default class Player {
  constructor() {
    this.name = '';
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.HP = 3;
    // this.playerView = new PlayerView(); → React에서는 View와 분리해 관리 (컴포넌트 렌더링)
  }

  // Getter
  getName() {
    return this.name;
  }

  getScore() {
    return this.score;
  }

  getCombo() {
    return this.combo;
  }

  getMaxCombo() {
    return this.maxCombo;
  }

  getHP() {
    return this.HP;
  }

  // Sett
  setName(name) {
    this.name = name;
  }

  setScore(score) {
    this.score = score;
  }

  setCombo(combo) {
    this.combo = combo;
  }

  setMaxCombo(maxCombo) {
    this.maxCombo = maxCombo;
  }

  setHP(hp) {
    this.HP = hp;
  }

  // Methods
  addScore(points) {
    if (this.combo > 0) {
      this.score += points * this.combo;
    } else {
      this.score += points;
    }
  }

  addCombo() {
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
  }

  subHP() {
    this.HP--;
  }
}