
//import clickPop from "../assets/soundEffect/clickPop.mp3";
import path from "path";

const basePath = path.join(__dirname, "../assets/soundEffect");



class SoundManager {
  constructor() {
    this.sounds = {
            // clickPop: new Audio(`file://${path.join(basePath, "clickPop.mp3")}`),
            clickPop: new Audio('D:/VocaRush-team/electron-vocarush-teamproject/src/renderer/assets/soundEffect/clickPop.mp3'),

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
}

export default new SoundManager(); // 싱글톤으로 export, 전체에서 하나만 공유돼서,
// 다른 페이지에서도 같은 효과음 매니저를 쓸 수 있음