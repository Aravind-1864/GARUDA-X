import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Shield, Save, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile } = useApp();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    gender: user?.gender || '',
    bio: user?.bio || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        gender: user.gender || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      updateProfile({
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim() || user.name
      });
      setIsSaving(false);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    }, 1000);
  };

  return (
    <div className="profile-page animate-fade-in">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="gradient-text">Personal Profile</h1>
        <p>Manage your identity and preference within Garuda X</p>
      </div>

      <div className="profile-grid">
        <div className="profile-sidebar">
          <div className="profile-identity-card glass-card">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <img src={user?.avatar} alt="Profile" className="profile-avatar" />
                <button className="change-avatar-btn" title="Change Avatar">
                  <Camera size={16} />
                </button>
              </div>
              <h3>{user?.name || 'User Profile'}</h3>
              <span className="user-role-badge">Premium Shield</span>
            </div>
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-val">{user?.history?.length || 0}</span>
                <span className="stat-lbl">Scans</span>
              </div>
              <div className="stat-sep"></div>
              <div className="stat-item">
                <span className="stat-val">Elite</span>
                <span className="stat-lbl">Tier</span>
              </div>
            </div>
          </div>

          <div className="security-status-card glass-card">
            <h4>Security Status</h4>
            <div className="status-indicator">
              <div className="dot pulse-green"></div>
              <span>Active Protection</span>
            </div>
            <p className="status-note">Your account is secured with end-to-end encryption.</p>
          </div>
        </div>

        <div className="profile-form-container glass-card">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3 className="section-title"><User size={18} /> Basic Information</h3>
              <div className="input-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Email (Verified)</label>
                  <div className="read-only-input">
                    <Mail size={14} />
                    <span>{formData.email}</span>
                    <Shield size={12} className="verified-icon" />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">About You</h3>
              <div className="form-group full-width">
                <label>Bio / Description</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  placeholder="Tell us a bit about your career goals..."
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={isSaving}>
                {isSaving ? (
                  <div className="btn-spinner"></div>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              {showStatus && <span className="save-success">Profile updated successfully!</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
