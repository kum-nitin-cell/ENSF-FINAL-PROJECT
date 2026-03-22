import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link to="/dashboard">AI Interviewer</Link>
      </div>
      
      <nav className="sidebar-links">
        <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard')}`}>
          Dashboard
        </Link>
        <Link to="/setup" className={`sidebar-link ${isActive('/setup')}`}>
          New Interview
        </Link>
        <Link to="/practice" className={`sidebar-link ${isActive('/practice')}`}>
          Question Bank
        </Link>
        <Link to="/history" className={`sidebar-link ${isActive('/history')}`}>
          Analytics & History
        </Link>
        <Link to="/profile" className={`sidebar-link ${isActive('/profile')}`}>
          Resume & Context
        </Link>
        <Link to="/settings" className={`sidebar-link ${isActive('/settings')}`}>
          Settings
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link w-full" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--error)' }}>
          Log Out
        </button>
      </div>
    </aside>
  );
}
