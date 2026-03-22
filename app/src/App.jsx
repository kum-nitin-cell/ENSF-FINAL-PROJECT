import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Simple placeholder components
const Login = () => <div className="p-4">Please Login</div>;
const Home = () => <div className="p-4">Welcome to the AI Mock Interview App! (Public)</div>;
const Dashboard = () => <div className="p-4">Private Dashboard: For Logged-in Users Only</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <h1>ENSF FINAL PROJECT</h1>

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Login />} />

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
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
