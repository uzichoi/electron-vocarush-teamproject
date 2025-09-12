export const Difficulty = { // 게임 난이도
    VERYEASY: 0, 
    EASY: 1,   
    NORMAL: 2, 
    HARD: 3,
    VERYHARD: 4
};

export const BoardSize = { // ROW, COL
    [Difficulty.VERYEASY]: 5, 
    [Difficulty.EASY]: 6,  
    [Difficulty.NORMAL]: 6,    
    [Difficulty.HARD]: 7,
    [Difficulty.VERYHARD]: 7
};

export const PlaceWordLength = { // 단어길이
    [Difficulty.VERYEASY]: 4, 
    [Difficulty.EASY]: 4,  
    [Difficulty.NORMAL]: 5,    
    [Difficulty.HARD]: 5,
    [Difficulty.VERYHARD]: 6
};