
//import clickPop from "../assets/soundEffect/clickPop.mp3";
import path from "path";

const basePath = path.join(__dirname, "../assets/soundEffect");



class SoundManager {
  constructor() {
    this.sounds = {
            // clickPop: new Audio(`file://${path.join(basePath, "clickPop.mp3")}`),
            clickPop: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/clickPop.mp3'),
            clickKeyboard: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/clickKeyboard.mp3'),
            kamera: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/kamera.mp3'),
            tada: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/tada.mp3'),
            //combo: new Audio('D:/VocaRush-team/electron-vocarush-teamproject/src/renderer/assets/soundEffect/combo.mp3'),
            combo4: new Audio('/home/pi/VocaRush-team/electron-vocarush-teamproject/src/renderer/assets/soundEffect/combo4.mp3'),
            combo3: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/combo3.mp3'),
            combo2: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/combo2.mp3'),
            combo1: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/combo1.mp3'),
            timeOver: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/timeOver.mp3'),
            funnyGasp: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/funnyGasp.mp3'),
            funnyScream: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/funnyScream.mp3'),
            gameBgm: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/gameBgm.mp3'),
            startBgm: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/startBgm.mp3'),
            clickTurn: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/clickTurn.mp3'),
            clickGameStart: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/clickGameStart.mp3'),
            bonusWord: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/bonusWord.mp3'),
            gameClock: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/gameClock.mp3'),
            gameWrong: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/gameWrong.mp3'),
            resultBgm: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/resultBgm.mp3'),
            rankingBgm: new Audio('/home/pi/electron-vocarush-teamproject/src/renderer/assets/soundEffect/rankingBgm.mp3'),
          };
  }

  play(name) {
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
    else {
      console.warn(`[SoundManager] 효과음 '${name}'을(를) 찾을 수 없습니다.`);
    }
  }

  // ✅ BGM 재생 전용
  playBgm(name) {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.currentTime = 0;
    }
    const bgm = this.sounds[name];
    if (bgm) {
      bgm.loop = true;   // 무한 반복
      bgm.volume = 0.3;  // 필요 시 볼륨 조절
      bgm.play();
      this.currentBgm = bgm;
    } else {
      console.warn(`[SoundManager] BGM '${name}'을(를) 찾을 수 없습니다.`);
    }
  }

  stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.currentTime = 0;
      this.currentBgm = null;
    }
  }


  playComboSound(combo) {
    let name;
    switch(combo) {

      case 1:
          name ="combo1"
          break;
      case 2:
          name ="combo2"
          break;
      case 3:
          name ="combo3"
          break;
      case 4:
          name ="combo4"
          break;
      case 5:
          name ="combo5"
          break;
    }

    const sound = this.sounds[name];
        if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
    else {
      console.warn(`[SoundManager] 효과음 '${name}'을(를) 찾을 수 없습니다.`);
    }
  }

playLoop(name) {
  const sound = this.sounds[name];
  if (sound) {
    sound.loop = true;
    sound.currentTime = 0;
    sound.play();
    this.currentLoop = sound;  // loop 전용 관리
  } else {
    console.warn(`[SoundManager] 루프 효과음 '${name}'을(를) 찾을 수 없습니다.`);
  }
}

stop(name) {
  const sound = this.sounds[name] || (this.currentLoop?.src.includes(name) ? this.currentLoop : null);
  if (sound) {
    sound.pause();
    sound.currentTime = 0;
    if (sound === this.currentLoop) {
      this.currentLoop = null;
    }
  }
}


}


export default new SoundManager(); // 싱글톤으로 export, 전체에서 하나만 공유돼서,
// 다른 페이지에서도 같은 효과음 매니저를 쓸 수 있음