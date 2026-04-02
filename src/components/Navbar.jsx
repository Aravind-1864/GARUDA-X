import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Bell, Menu, X, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onMenuToggle, menuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user && (
          <button className="menu-btn" onClick={onMenuToggle}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <div className="brand-icon">
            <Shield size={18} />
          </div>
          <span className="brand-name">GARUDA<span className="brand-x">X</span></span>
          <span className="brand-tag">BETA</span>
        </div>
      </div>

      <div className="navbar-center">
        <div className="status-pill">
          <span className="status-dot"></span>
          <span>AI Engine Active</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="icon-btn theme-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <>
            <button className="icon-btn notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
              <Bell size={18} />
              <span className="notif-badge">3</span>
            </button>
            <div className="avatar" onClick={() => navigate('/profile')}>
              <img src={user.avatar} alt={user.name} />
            </div>
          </>
        ) : (
          <button className="btn-primary login-nav-btn" onClick={() => navigate('/login')} style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '10px' }}>
            Sign In
          </button>
        )}
      </div>

      {notifOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">Notifications</div>
          {[
            { icon: '🔴', text: 'High-risk internship detected', time: '2m ago' },
            { icon: '🟡', text: 'New suspicious listing found', time: '1h ago' },
            { icon: '🟢', text: 'Analysis complete for TechPro', time: '3h ago' },
          ].map((n, i) => (
            <div key={i} className="notif-item">
              <span>{n.icon}</span>
              <div>
                <p>{n.text}</p>
                <small>{n.time}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
