import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Mail, Lock, ArrowRight, Github, X, User, CheckCircle } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { login, register, validateUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/analyze";

  const handleAuth = (userData, method = 'Email') => {
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (isLogin && method === 'Email') {
        const validated = validateUser(userData.email, userData.password);
        if (!validated) {
          setError("Invalid email or password. Please try again.");
          setLoading(false);
          return;
        }
        login(validated);
      } else if (!isLogin && method === 'Email') {
        register(userData);
      } else {
        // Social login (auto-register/login)
        login(userData);
      }
      
      setLoading(false);
      navigate(from, { replace: true });
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const userData = {
      email,
      password,
      name: email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      provider: 'Email'
    };

    handleAuth(userData);
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      setShowGoogleModal(true);
    } else {
      setShowGithubModal(true);
    }
  };

  const MOCK_GOOGLE_ACCOUNTS = [];

  return (
    <div className="login-page">
      <div className="login-backdrop">
        <div className="glow-circle gc-1"></div>
        <div className="glow-circle gc-2"></div>
      </div>

      <div className="login-container animate-fade-in-up">
        <div className="login-card glass-card">
          <div className="login-header">
            <div className="login-logo">
              <Shield size={32} />
            </div>
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLogin ? 'Secure your internship hunt today' : 'Join the elite squad of safe interns'}</p>
          </div>

          {error && <div className="login-error-msg">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label><Mail size={14} /> Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label><Lock size={14} /> Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            {!isLogin && (
              <div className="form-group animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                <label><Lock size={14} /> Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                />
              </div>
            )}

            {isLogin && (
              <div className="forgot-pass">
                <button type="button" onClick={() => setShowForgotModal(true)}>Forgot password?</button>
              </div>
            )}

            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button 
              className="social-btn glass-card" 
              onClick={() => handleSocialLogin('GitHub')}
              disabled={loading}
            >
              <Github size={20} />
              GitHub
            </button>
            <button 
              className="social-btn glass-card" 
              onClick={() => handleSocialLogin('Google')}
              disabled={loading}
            >
              <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" width="22" />
              Google
            </button>
          </div>

          <div className="login-footer">
            {isLogin ? (
              <p>Don't have an account? <button onClick={() => { setIsLogin(false); setError(''); }}>Sign up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => { setIsLogin(true); setError(''); }}>Sign in</button></p>
            )}
          </div>
        </div>
      </div>

      {/* Google Login Instructions Modal */}
      {showGoogleModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content google-picker animate-fade-in-up">
            <div className="modal-header" style={{ justifyContent: 'center', marginBottom: 0, position: 'relative' }}>
              <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" width="48" />
              <button className="close-modal" onClick={() => setShowGoogleModal(false)} style={{ position: 'absolute', right: -20, top: -20 }}><X size={20} /></button>
            </div>
            <h2>Sign in with Google</h2>
            <p className="modal-sub">to continue to <strong>Garuda X</strong></p>
            
            <div className="account-list">
              <div className="account-item use-another" onClick={() => setShowGoogleModal(false)}>
                <div className="acc-icon-circle"><User size={18} /></div>
                <span>Please use the email form on the main page for direct login.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Login Modal */}
      {showGithubModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content github-modal animate-fade-in-up">
            <div className="modal-header" style={{ justifyContent: 'center' }}>
              <Github size={48} />
              <button className="close-modal" onClick={() => setShowGithubModal(false)} style={{ position: 'absolute', right: 20 }}><X size={20} /></button>
            </div>
            <h2>Sign in to GitHub</h2>
            <p className="modal-sub">to authorize <strong>Garuda X</strong></p>
            
            <form className="modal-form" onSubmit={(e) => { 
                e.preventDefault(); 
                handleAuth({
                  email: 'github_user@gmail.com',
                  name: 'GitHub User',
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GitHub',
                  provider: 'GitHub'
                }, 'GitHub'); 
              }}>
              <div className="m-group">
                <label>Username or email address</label>
                <input type="text" className="m-input" placeholder="Enter username" required />
              </div>
              <div className="m-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Password</label>
                  <a href="#" className="m-link">Forgot?</a>
                </div>
                <input type="password" size="small" className="m-input" placeholder="••••••••" required />
              </div>
              <button type="submit" className="m-btn-github" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content forgot-modal animate-fade-in-up">
            <button className="close-modal" onClick={() => { setShowForgotModal(false); setResetSent(false); }} style={{ position: 'absolute', right: 20, top: 20 }}>
              <X size={20} />
            </button>
            
            {!resetSent ? (
              <div className="forgot-flow">
                <div className="modal-icon-header">
                  <Shield size={40} color="var(--accent)" />
                </div>
                <h2>Reset Password</h2>
                <p className="modal-sub text-center">Enter your email and we'll send you a link to reset your password.</p>
                
                <form className="modal-form" onSubmit={(e) => { e.preventDefault(); setResetSent(true); }}>
                  <div className="m-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      className="m-input" 
                      placeholder="name@example.com" 
                      required 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ height: 48, marginTop: 10 }}>
                    Send Reset Link
                  </button>
                </form>
              </div>
            ) : (
              <div className="forgot-success text-center">
                <div className="modal-icon-header">
                  <CheckCircle size={48} color="var(--success)" />
                </div>
                <h2>Link Sent!</h2>
                <p className="modal-sub">We've sent a password reset link to <br/><strong>{resetEmail}</strong></p>
                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', height: 48, marginTop: 20 }}
                  onClick={() => setShowForgotModal(false)}
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
