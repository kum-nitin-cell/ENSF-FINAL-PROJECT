import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';

export default function AuthPage() {
  const { user, signIn, signUp, resetPassword, isRecovery } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // If this is a password recovery session, go to the reset page
  if (user && isRecovery) {
    return <Navigate to="/reset-password" replace />;
  }

  // Redirect if already logged in
  if (user) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage('If an account exists, you will receive a password reset email.');
      } else if (isLogin) {
        const { error } = await signIn({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const { error } = await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        if (error) throw error;
        setMessage('Registration successful! Please check your email to verify your account.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">AI Mock Interview App</h1>
        <p className="auth-tagline">Practice interviews with AI feedback</p>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        {!isForgotPassword && (
          <div className="auth-tabs">
            <button type="button" className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Log In</button>
            <button type="button" className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Sign Up</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && !isForgotPassword && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          {!isForgotPassword && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
          )}

          {!isLogin && !isForgotPassword && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
          )}

          {isLogin && !isForgotPassword && (
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" className="link-button" onClick={() => setIsForgotPassword(true)}>Forgot password?</button>
            </div>
          )}

          {!isLogin && !isForgotPassword && (
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required /> I agree to the <Link to="/terms" target="_blank" style={{ color: '#4f46e5' }}>Terms and Privacy Policy</Link>
              </label>
            </div>
          )}

          <button type="submit" className="btn primary block" disabled={loading}>
            {loading ? 'Processing...' : (isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Log In' : 'Sign Up'))}
          </button>

          {isForgotPassword && (
            <button type="button" className="link-button block center mt-4" onClick={() => setIsForgotPassword(false)}>
              Back to Log In
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
