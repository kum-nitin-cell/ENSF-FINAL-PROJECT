import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'History', path: '/history' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">AI Mock Interview</Link>
      </div>
      <div className="nav-links">
        {navLinks.map(link => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.name}
          </Link>
        ))}
        <button onClick={handleLogout} className="nav-logout">Log out</button>
      </div>
    </nav>
  );
}
