import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, History, BarChart2, Settings, AlertTriangle, ShieldAlert, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Analyze', path: '/analyze' },
  { icon: History, label: 'History', path: '/history' },
  { icon: BarChart2, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: ShieldAlert, label: 'Awareness', path: '/awareness' },
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-inner">
        {/* Threat meter */}
        <div className="threat-box">
          <div className="threat-box-header">
            <AlertTriangle size={14} />
            <span>Threat Level Today</span>
          </div>
          <div className="threat-bar-track">
            <div className="threat-bar-fill" style={{ '--fill': '62%' }}></div>
          </div>
          <div className="threat-stats">
            <span style={{ color: 'var(--accent-orange)' }}>MEDIUM</span>
            <span>62 / 100</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-label">MAIN MENU</div>
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {location.pathname === path && <div className="nav-indicator" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <nav className="sidebar-nav">
          <div className="nav-label">SUPPORT</div>
          <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* User Card */}
        {user && (
          <div className="sidebar-user-card glass-card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-status">Active Protection</span>
            </div>
          </div>
        )}

        {/* Version */}
        <div className="sidebar-footer">
          <div className="version-tag">v2.0 Advanced</div>
          <div className="sidebar-footer-text">Built with ❤️ for students</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
