export default class Player {
  constructor(name) {
    this.name = name;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hp = 5;
    // this.playerView = new PlayerView(); → React에서는 View와 분리해 관리 (컴포넌트 렌더링)
    
    this.wordsFound = 0;
    this.totalAttempts = 0;

    this.photoPath = null; //사진 경로
}

  getData() {
    return {
      name: this.getName(),
      score: this.getScore(),
      maxCombo: this.getMaxCombo(),
      combo: this.getCombo(),
      wordsFound: this.getWordsFound(),
      accuracy: this.getAccuracy(),
      hp: this.getHP(),    // 추가
    };
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
    return this.hp;
  }

  getWordsFound() {
    return this.wordsFound;
}

getAccuracy() {
    if(this.totalAttempts == 0) return 0;
    return Math.round((this.wordsFound / this.totalAttempts) * 100);
}

getPhoto(){
  return this.photoPath;
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
    this.hp = hp;
  }

  setPhoto(path){
    this.photoPath = path;
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
    this.hp--;
  }

  addWord(correct){
    this.totalAttempts++;
    if(correct){
        this.wordsFound++;
    }
  }
}