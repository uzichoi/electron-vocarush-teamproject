import fs from "fs";
import path from "path";

// 랭킹 파일은 프로젝트 루트에 저장
const rankingPath = path.join(process.cwd(), "ranking.json");

class Ranking {
  constructor() {
    this.rankings = [];
  }

  getCurrentDate() {
    const now = new Date();
    return now.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  load() {
    try {
      const data = fs.readFileSync(rankingPath, "utf-8");
      this.rankings = JSON.parse(data);
    } catch {
      this.rankings = [];
    }
  }

  save() {
    fs.writeFileSync(rankingPath, JSON.stringify(this.rankings, null, 2));
  }

  add(name, score) {
    const date = this.getCurrentDate();
    this.rankings.push({ name, score, date });
  }

  clear() {
    this.rankings = [];
  }

  removeFile() {
    if (fs.existsSync(rankingPath)) {
      fs.unlinkSync(rankingPath);
    }
  }

  getTopEntries(count = 20) {
    const allEntries = [...this.rankings];

    allEntries.sort((a, b) => b.score - a.score);

    return allEntries.slice(0, count);
  }
}

export default new Ranking();
