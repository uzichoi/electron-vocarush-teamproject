// React는 src/renderer/App.jsx부터 시작됨

import React from "react";    // default export
import { createRoot } from "react-dom/client";    // named export
// React 18부터는 react-dom에서 render을 직접 쓰지 않고 createRoot를 써야 한다. 현재 버전 react@19.1.1
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import StartPage from "./views/pages/StartPage";  
import GamePage from "./views/pages/GamePage";
import ManualPage from "./views/pages/ManualPage";
import ResultPage from "./views/pages/ResultPage";
import RankingPage from "./views/pages/RankingPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/start" element={<StartPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/manual" element={<ManualPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="*" element={<Navigate to="/start" replace />} />
      </Routes>
    </HashRouter>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(<App />);