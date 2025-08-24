// models/Direction.js


export const Direction = {
  HORIZONTAL: { name: "HORIZONTAL", dx: 1, dy: 0 },
  VERTICAL: { name: "VERTICAL", dx: 0, dy: 1 },
  DIAGONAL_DOWN: { name: "DIAGONAL_DOWN", dx: 1, dy: 1 },
  DIAGONAL_UP: { name: "DIAGONAL_UP", dx: 1, dy: -1 }
};

// 방향 이름들만 추출하는 유틸리티
export const DIRECTION_NAMES = Object.keys(Direction);

// 랜덤 방향 선택용
export function getRandomDirection() {
  const names = DIRECTION_NAMES;
  return Direction[names[Math.floor(Math.random() * names.length)]];
}
