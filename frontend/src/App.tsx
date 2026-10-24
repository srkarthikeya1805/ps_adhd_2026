import React from 'react';
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
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      {/* Animated GPU-accelerated Neural Network Backdrop on every page */}
      <NeuralBackground />

      <Routes>
        {/* Public Landing & Login */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Workspace */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="results" element={<ResultsPage />} />
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
  );
}

export default App;
