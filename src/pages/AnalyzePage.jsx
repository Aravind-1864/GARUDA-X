import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeInternship } from '../utils/api';
import ScreenshotUploader from '../components/ScreenshotUploader';
import ResultCard from '../components/ResultCard';
import { Search, FileText, Building, Briefcase, AlertCircle, Wifi } from 'lucide-react';
import './AnalyzePage.css';

const STEPS = ['Input Data', 'AI Analysis', 'Risk Report'];

const PLATFORMS = [
  { value: 'linkedin',   label: 'LinkedIn',    emoji: '💼' },
  { value: 'naukri',     label: 'Naukri',      emoji: '🔵' },
  { value: 'internshala',label: 'Internshala', emoji: '🎓' },
  { value: 'email',      label: 'Email',       emoji: '📧' },
  { value: 'whatsapp',   label: 'WhatsApp',    emoji: '💬' },
  { value: 'telegram',   label: 'Telegram',    emoji: '✈️' },
  { value: 'other',      label: 'Other',       emoji: '🔗' },
];

const ANALYSIS_STAGES = [
  'Parsing input data...',
  'Running NLP analysis...',
  'ML pattern detection...',
  'Scoring risk categories...',
  'Compiling risk report...',
];

const LoadingScreen = ({ progress, stage }) => (
  <div className="loading-screen">
    <div className="loading-inner">
      <div className="loading-ring">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(108,99,255,0.1)" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="url(#grad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6c63ff" />
              <stop offset="100%" stopColor="#00d4aa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="loading-percent">{progress}%</div>
      </div>
      <h3 className="loading-title">Analyzing Internship...</h3>
      <p className="loading-stage">{stage}</p>
      <div className="loading-stages">
        {ANALYSIS_STAGES.map((s, i) => (
          <div key={s} className={`stage-item ${progress > i * 20 ? 'done' : ''}`}>
            <span className="stage-dot" />
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AnalyzePage = () => {
  const { addToHistory } = useApp();
  const [step, setStep] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [platform, setPlatform] = useState('other');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!textInput.trim() && !file) {
      setError('Please provide internship text or upload a screenshot.');
      return;
    }
    setError('');
    setLoading(true);
    setLoadingProgress(0);

    let prog = 0;
    let stageIdx = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 10 + 5;
      stageIdx = Math.min(Math.floor((prog / 100) * ANALYSIS_STAGES.length), ANALYSIS_STAGES.length - 1);
      if (prog >= 90) { prog = 90; clearInterval(interval); }
      setLoadingProgress(Math.round(prog));
      setLoadingStage(ANALYSIS_STAGES[stageIdx]);
    }, 180);

    try {
      const res = await analyzeInternship({ text: textInput, file, company, role, platform });
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => {
        setResult(res);
        addToHistory(res);
        setLoading(false);
        setStep(2);
      }, 500);
    } catch (e) {
      clearInterval(interval);
      setLoading(false);
      setError(e.message || 'Analysis failed. Make sure the backend is running on port 5000.');
    }
  };

  const handleReset = () => {
    setResult(null);
    setTextInput('');
    setCompany('');
    setRole('');
    setPlatform('other');
    setFile(null);
    setStep(0);
    setError('');
  };

  return (
    <div className="analyze-page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Search size={24} />
            Internship Analyzer
          </h1>
          <p className="page-desc">Paste the internship description or upload a screenshot for AI-powered risk assessment.</p>
        </div>
        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`step ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`}>
                <div className="step-circle">{step > i ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`step-line ${step > i ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {loading && <LoadingScreen progress={loadingProgress} stage={loadingStage} />}

      {!loading && !result && (
        <div className="analyze-form">
          {/* Company + Role */}
          <div className="form-row">
            <div className="form-group glass-card">
              <label className="form-label">
                <Building size={14} />
                Company Name
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. TechSolutions Pvt Ltd"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
            </div>
            <div className="form-group glass-card">
              <label className="form-label">
                <Briefcase size={14} />
                Role / Position
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Web Developer Intern"
                value={role}
                onChange={e => setRole(e.target.value)}
              />
            </div>
          </div>

          {/* Source Platform */}
          <div className="form-group glass-card">
            <label className="form-label">
              <Wifi size={14} />
              Source Platform
              <span className="label-badge">Affects Risk Score</span>
            </label>
            <div className="platform-grid">
              {PLATFORMS.map(p => (
                <button
                  key={p.value}
                  className={`platform-btn ${platform === p.value ? 'selected' : ''}`}
                  onClick={() => setPlatform(p.value)}
                  type="button"
                >
                  <span className="platform-emoji">{p.emoji}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <div className="form-group glass-card">
            <label className="form-label">
              <FileText size={14} />
              Internship Description / Message
            </label>
            <textarea
              className="input-field"
              rows={9}
              placeholder={`Paste the full internship listing, email, WhatsApp message, or job description here...\n\nExample: "We are urgently hiring web developer interns. No experience needed. Pay ₹999 registration fee to get started. Earn ₹50,000 per week from home. 100% job guarantee. Contact on WhatsApp: +91..."`}
              value={textInput}
              onChange={e => {
                setTextInput(e.target.value);
                if (e.target.value.length > 5 && step === 0) setStep(1);
              }}
            />
            <div className="char-count">{textInput.length} characters</div>
          </div>

          {/* Upload */}
          <div className="form-group glass-card">
            <label className="form-label">
              📷 Upload Screenshot (Optional)
              <span className="label-badge">OCR-Powered</span>
            </label>
            <ScreenshotUploader onFileSelect={f => { setFile(f); if (f && step === 0) setStep(1); }} />
          </div>

          {error && (
            <div className="error-msg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            className="btn-primary analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            <Search size={18} />
            Analyze Internship
          </button>
        </div>
      )}

      {!loading && result && (
        <ResultCard result={result} onNewAnalysis={handleReset} />
      )}
    </div>
  );
};

export default AnalyzePage;
