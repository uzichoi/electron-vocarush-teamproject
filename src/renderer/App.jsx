// React는 src/renderer/App.jsx부터 시작

import React from "react";    
import { createRoot } from "react-dom/client";   // React 18부터는 react-dom에서 render을 직접 쓰지 않고 createRoot를 써야 한다. 현재 버전 react@19.1.1
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import StartView from "./views/StartView";  
import ConfigView from "./views/PlayerConfigurationView";
import GameView from "./views/GameView";
import ManualView from "./views/ManualView";
import ResultView from "./views/ResultView";
import RankingView from "./views/RankingView";

import {useGameController} from "./hooks/useGameController";
import { GameControllerProvider } from "./hooks/useGameController"; 
import { GameController } from "./controllers/GameController";

function App() {
  return (
    <GameControllerProvider>
      <HashRouter>
        <Routes>
          <Route path="/start" element={<StartView />} />
          <Route path="/config" element={<ConfigView />} />     
          <Route path="/game" element={<GameView />} />         
          <Route path="/manual" element={<ManualView />} />
          <Route path="/result" element={<ResultView />} />
          <Route path="/ranking" element={<RankingView />} />
          <Route path="*" element={<Navigate to="/start" replace />} />
        </Routes>
      </HashRouter>
    </GameControllerProvider>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(<App />);