export const Direction = {
    HORIZONTAL: 0, // ��
    VERTICAL: 1,   // ��
    RIGHTDIAGONAL: 2,    // ��
    LEFTDIAGONAL: 3
};

export const Order = {  // 단어 정방향, 역방향 배치 구분용
    FORWARD: 0, // 정방향
    BACKWARD: 1, // 역방향   
};


export const DX = {
    [Direction.HORIZONTAL]: 1,
    [Direction.VERTICAL]: 0,
    [Direction.RIGHTDIAGONAL]: 1,
    [Direction.LEFTDIAGONAL]: -1,
};

export const DY = {
    [Direction.HORIZONTAL]: 0,
    [Direction.VERTICAL]: 1,
    [Direction.RIGHTDIAGONAL]: 1,
    [Direction.LEFTDIAGONAL]: 1,
};