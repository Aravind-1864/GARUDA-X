import React from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Bell, Shield, Eye, Database, Trash2, Moon, Sun } from 'lucide-react';
import './SettingsPage.css';

const SettingsPage = () => {
  const { settings, updateSettings, clearHistory } = useApp();

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">
          <SettingsIcon size={24} />
          Settings
        </h1>
        <p className="page-desc">Manage your account preferences and application data.</p>
      </div>

      <div className="settings-grid animate-fade-in-up">
        {/* Preference Section */}
        <div className="settings-card glass-card">
          <div className="card-header">
            <Shield size={18} />
            <h3>General Preferences</h3>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Expert Mode</h4>
                <p>Display detailed technical AI heuristics in reports.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.expertMode} 
                  onChange={() => handleToggle('expertMode')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Push Notifications</h4>
                <p>Receive alerts when the global threat level changes.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.notifications} 
                  onChange={() => handleToggle('notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="settings-card glass-card">
          <div className="card-header">
            <Eye size={18} />
            <h3>Privacy & Data</h3>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Anonymized Contribution</h4>
                <p>Share scam metadata to improve the global AI model.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Data Persistence</h4>
                <p>Save scan history locally on this device.</p>
              </div>
              <div className="select-wrapper">
                <select 
                  value={settings.dataPrivacy} 
                  onChange={(e) => updateSettings({ dataPrivacy: e.target.value })}
                  className="settings-select"
                >
                  <option value="none">Disabled</option>
                  <option value="standard">Standard (Local Only)</option>
                  <option value="cloud">Cloud Sync (Beta)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-card glass-card danger-section">
          <div className="card-header">
            <Database size={18} />
            <h3>System Data</h3>
          </div>
          <p className="danger-desc">These actions are permanent and cannot be undone.</p>
          <div className="danger-actions">
            <button className="btn-danger-outline" onClick={() => {
              if(window.confirm('Clear all your scan history?')) clearHistory();
            }}>
              <Trash2 size={16} />
              Clear Scan History
            </button>
            <button className="btn-danger-outline">
              <Shield size={16} />
              Reset All Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
