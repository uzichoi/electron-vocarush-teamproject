// src/renderer/App.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import StartView from "./views/StartView";
import ConfigView from "./views/PlayerConfigurationView";
import GameView from "./views/GameView";
import ManualView from "./views/ManualView";
import ResultView from "./views/ResultView";
import RankingView from "./views/RankingView";

import { GameControllerProvider } from "./hooks/useGameController"; // Provider만 import

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
