import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import './App.css';

// Simple placeholder components
const Home = () => <div className="p-4">Welcome to the AI Mock Interview App! (Public)</div>;
const Dashboard = () => <div className="p-4">Private Dashboard: For Logged-in Users Only</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Redirect any other route to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
