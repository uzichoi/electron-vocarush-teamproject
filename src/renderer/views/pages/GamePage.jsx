import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// React: 컴포넌트를 만들기 위한 기본 라이브러리
// useState: 컴포넌트의 상태(데이터)를 관리하는 Hook(소프트웨어 구성 요소 간에 발생하는 함수 호출, 메시지, 이벤트 등을 중간에서 바꾸거나 가로채는 명령, 방법, 기술이나 행위)
// useEffect: 컴포넌트가 화면에 나타날 때 실행할 코드를 정의
// useNavigate: 다른 페이지로 이동할 때 사용하는 훅

export default function GamePage() {
    const navigate = useNavigate();     // navigate: 다른 페이지로 이동하는 기능을 담은 변수
    const [gameState, setGameState] = useState({    // gameState: 현재 게임 상태를 담은 변수, setGameState: 게임 상태를 변경할 때 사용하는 함수
        // 단어 배치 알고리즘은 추후 수정 후 반영할 예정
        currentWord: "about",   // 현재 찾아야 하는 단어
        foundLetters: ['a', 'b', 'o', 'u', 't'],    // 찾은 글자들
        player1: {
            name: "Player 1",
            score: 0,
            combo: 0,
            maxCombo: 0,
            hp: 3
        },
        player2: {
            name: "Player 2", 
            score: 0,
            combo: 0,
            maxCombo: 0,
            hp: 3
        },
        inputValue: "",     // 플레이어가 입력한 단어
        timeIncreased: 0        // 증가한 시간(초)
    });

    // 단어 그리드 생성 (10x10)
    const generateGrid = () => {
        const grid = [];        // 빈 그리드 준비
        const word = gameState.currentWord.toUpperCase();   // 대문자로 변환
        
        for (let i = 0; i < 10; i++) {
            const row = [];
            for (let j = 0; j < 10; j++) {
                // 단어의 글자들을 랜덤하게 배치
                if (i === 3 && j >= 2 && j < 2 + word.length) {
                    row.push(word[j - 2]);
                } else if (Math.random() < 0.3) {
                    // 30% 확률로 랜덤 알파벳 배치
                    const randomLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    row.push(randomLetters[Math.floor(Math.random() * randomLetters.length)]);
                } else {
                    row.push('*');  // 나머지는 빈 칸(*)으로 매핑
                }
            }
            grid.push(row);
        }
        return grid;    // 완성된 10*10 그리드 반환
    };

    const [grid, setGrid] = useState(generateGrid());   // grid: 10*10 글자 격자를 담은 변수, setGrid: 격자를 업데이트할 때 사용

    // 타이머
    useEffect(() => {
        const timer = setInterval(() => {   // 1초마다 실행
            setGameState(prev => ({
                ...prev,    // 기존 상태 복사
                timeIncreased: prev.timeIncreased < 300 ? prev.timeIncreased + 1 : 300      // 최대 3분. 1초씩 증가
            }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleInputSubmit = (e) => {      // 단어 입력 처리
        e.preventDefault();
        // 단어 검증 로직 (추후 구현)
        console.log("Submitted word:", gameState.inputValue);   // 콘솔에 출력
        setGameState(prev => ({ ...prev, inputValue: "" }));    // 입력창 비우기
    };

    // 시간 포맷팅
    const formatTime = (seconds) => {   
        const mins = Math.floor(seconds / 60);  // 분 계산
        const secs = seconds % 60;              // 초 계산
        return `${mins}:${secs.toString().padStart(2, '0')}`;   // "1:05" 형태로 반환
    };

    // 화면 구성 시작
    return (       // 화면에 보여 줄 HTML 구조 반환
        <div className="game-view">
            <header className="game-header">
                <div className="header-left">
                    <div className="game-title">VOCARUSH</div>
                </div>
                <div className="header-center">
                    <div className="game-timer">{formatTime(gameState.timeIncreased)}</div>
                </div>
                <div className="header-right">
                    <button className="btn-small" onClick={() => navigate('/result')}>
                        Quit
                    </button>
                </div>
            </header>
 
            {/* 메인 게임 영역 */}
            <main className="game-main">
                {/* 왼쪽 플레이어 정보 */}
                <div className="player-info">
                    {/* 플레이어 사진 박스 */}
                    <div className="player-photo">
                        <div className="photo-placeholder">
                            <span>📷</span>
                        </div>
                    </div>
                    
                    <div className="player-card">
                        <h3>Player 1</h3>
                        <div className="stat">
                            <span>Name:</span> 
                            <span className="value">{gameState.player1.name}</span>
                        </div>
                        <div className="stat">
                            <span>Score:</span> 
                            <span className="value score">{gameState.player1.score}</span>
                        </div>
                        <div className="stat">
                            <span>Combo:</span> 
                            <span className="value combo">{gameState.player1.combo}</span>
                        </div>
                        <div className="stat">
                            <span>Max Combo:</span> 
                            <span className="value">{gameState.player1.maxCombo}</span>
                        </div>
                        <div className="stat">
                            <span>HP:</span> 
                            <div className="hp-bar">
                                {[...Array(3)].map((_, i) => (
                                    <div 
                                        key={i}
                                        className={`hp-heart ${i < gameState.player1.hp ? 'active' : ''}`}
                                    >
                                        ♥
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 중앙 게임 보드 */}
                <div className="game-board">
                    <div className="word-grid">
                        {grid.map((row, i) => (
                            <div key={i} className="grid-row">
                                {row.map((cell, j) => (
                                    <div 
                                        key={j} 
                                        className={`grid-cell ${cell !== '*' ? 'letter' : 'empty'}`}
                                    >
                                        {cell}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 오른쪽 플레이어 정보 */}
                <div className="player-info">
                    {/* 플레이어 사진 박스 */}
                    <div className="player-photo">
                        <div className="photo-placeholder">
                            <span>📷</span>
                        </div>
                    </div>
                    
                    <div className="player-card">
                        <h3>Player 2</h3>
                        <div className="stat">
                            <span>Name:</span> 
                            <span className="value">{gameState.player2.name}</span>
                        </div>
                        <div className="stat">
                            <span>Score:</span> 
                            <span className="value score">{gameState.player2.score}</span>
                        </div>
                        <div className="stat">
                            <span>Combo:</span> 
                            <span className="value combo">{gameState.player2.combo}</span>
                        </div>
                        <div className="stat">
                            <span>Max Combo:</span> 
                            <span className="value">{gameState.player2.maxCombo}</span>
                        </div>
                        <div className="stat">
                            <span>HP:</span> 
                            <div className="hp-bar">
                                {[...Array(3)].map((_, i) => (
                                    <div 
                                        key={i}
                                        className={`hp-heart ${i < gameState.player2.hp ? 'active' : ''}`}
                                    >
                                        ♥
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 하단 입력 영역 */}
            <footer className="game-input">
                <form onSubmit={handleInputSubmit} className="input-form">
                    <div className="input-container">
                        <span className="input-label">Input &gt;&gt;</span>
                        <input 
                            type="text"
                            value={gameState.inputValue}
                            onChange={(e) => setGameState(prev => ({ 
                                ...prev, 
                                inputValue: e.target.value.toUpperCase() 
                            }))}
                            className="word-input"
                            placeholder="Type your word..."
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary submit-btn">
                            SUBMIT
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
}