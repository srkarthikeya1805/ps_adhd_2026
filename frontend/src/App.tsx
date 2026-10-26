import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NeuralBackground } from './components/common/NeuralBackground';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { UploadPage } from './pages/UploadPage';
import { ResultsPage } from './pages/ResultsPage';
import { BatchResultsPage } from './pages/BatchResultsPage';
import { ModelEnsemblePage } from './pages/ModelEnsemblePage';
import { SignalExplorerPage } from './pages/SignalExplorerPage';
import { BrainRecoveryPage } from './pages/BrainRecoveryPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

// Context to allow replaying the cinematic opening from any navbar or button
export const IntroContext = createContext<{
  replayIntro: () => void;
  introTrigger: number;
}>({
  replayIntro: () => {},
  introTrigger: 0,
});

export const useIntro = () => useContext(IntroContext);

export function App() {
  const [introTrigger, setIntroTrigger] = useState(0);

  const replayIntro = () => {
    setIntroTrigger((prev) => prev + 1);
  };

  return (
    <IntroContext.Provider value={{ replayIntro, introTrigger }}>
      <BrowserRouter>
        {/* Persistent Dark Blue Neural Nerve Background on Every Route */}
        <NeuralBackground />

        {/* Application Page Routing */}
        <Routes>
          {/* Public Landing & Login */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard Workspace */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverviewPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="neuro-care" element={<BrainRecoveryPage />} />
            <Route path="batch" element={<BatchResultsPage />} />
            <Route path="models" element={<ModelEnsemblePage />} />
            <Route path="signal-explorer" element={<SignalExplorerPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </IntroContext.Provider>
  );
}

export default App;
