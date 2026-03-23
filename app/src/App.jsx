import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import SessionSummaryPage from './pages/SessionSummaryPage';
import QuestionBankPage from './pages/QuestionBankPage';
import SettingsPage from './pages/SettingsPage';
import TermsAndPrivacyPage from './pages/TermsAndPrivacyPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/setup" element={
            <ProtectedRoute>
              <Layout><InterviewSetupPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/session/:id" element={
            <ProtectedRoute>
              <Layout><InterviewSessionPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/summary/:id" element={
            <ProtectedRoute>
              <Layout><SessionSummaryPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><ProfilePage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/practice" element={
            <ProtectedRoute>
              <Layout><QuestionBankPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute>
              <Layout><HistoryPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout><SettingsPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/terms" element={<TermsAndPrivacyPage />} />

          {/* Default redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
