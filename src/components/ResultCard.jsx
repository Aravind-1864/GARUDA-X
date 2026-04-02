import React, { useState } from 'react';
import { downloadReport } from '../utils/api';
import {
  AlertTriangle, CheckCircle, XCircle, Clock, Zap, Download,
  ShieldAlert, TrendingUp, Eye, Building, Cpu, RefreshCw, Share2, Info, Layout
} from 'lucide-react';
import './ResultCard.css';

// ─── Verdict Config ─────────────────────────────────────────────────────────

const VERDICT_CONFIG = {
  LIKELY_SCAM:  { label: 'Likely Scam',     color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)', icon: XCircle,      tier: 5, glow: 'rgba(255,77,109,0.4)', level: 'HIGH' },
  HIGH_RISK:    { label: 'High Risk',       color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: ShieldAlert,  tier: 4, glow: 'rgba(249,115,22,0.2)', level: 'HIGH' },
  SUSPICIOUS:   { label: 'Suspicious',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle, tier: 3, glow: 'rgba(245,158,11,0.2)', level: 'MEDIUM' },
  LOW_RISK:     { label: 'Low Risk',        color: '#63b3ed', bg: 'rgba(99,179,237,0.1)', icon: CheckCircle,  tier: 2, glow: 'rgba(99,179,237,0.2)', level: 'LOW' },
  GENUINE:      { label: 'Verified Genuine', color: '#00d4aa', bg: 'rgba(0,212,170,0.1)', icon: CheckCircle,  tier: 1, glow: 'rgba(0,212,170,0.3)', level: 'LOW' },
  NOT_RELEVANT: { label: 'Irrelevant Content', color: '#a0aec0', bg: 'rgba(160,174,192,0.1)', icon: Info,      tier: 0, glow: 'rgba(160,174,192,0.2)' },
};

const CATEGORY_LABELS = {
  payment_risk:           { label: 'Payment Requests',      icon: '💰' },
  manipulation_risk:      { label: 'Artificial Urgency',    icon: '⏳' },
  recruiter_risk:         { label: 'Recruiter Legitimacy',  icon: '👤' },
  company_trust_risk:     { label: 'Brand Authenticity',    icon: '🏢' },
  unrealistic_offer_risk: { label: 'Offer Sustainability',  icon: '📈' },
};

// ─── Main ResultCard ────────────────────────────────────────────────────────

const ResultCard = ({ result, onNewAnalysis }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [exportLoading, setExportLoading] = useState(false);

  const {
    verdict = 'SUSPICIOUS',
    risk = 'suspicious',
    risk_score = 0,
    risk_level = 'LOW',
    signals = [],
    company = 'Unknown Company',
    role = 'Unknown Role',
    platform,
    categoryRisks,
    breakdown,
    recommendations = [],
    message = '',
    suspiciousPhrases = [],
    extractedText,
    analysisTime = '1.2',
    flags = [],
  } = result;

  const score = result.score || result.risk_score || 0;

  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.SUSPICIOUS;
  const VerdictIcon = config.icon;

  const handleExport = () => {
    setExportLoading(true);
    downloadReport(result);
    setTimeout(() => setExportLoading(false), 1500);
  };

  const handleShare = () => {
    const text = `⚠️ GARUDA X ALERT: Found a ${config.label} for ${role} at ${company}. Risk Score: ${score}/100. Be careful!`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className={`result-view verdict-${verdict.toLowerCase()}`}>
      
      {/* Background Glow */}
      <div className="result-backdrop" style={{ background: `radial-gradient(circle at 50% 50%, ${config.glow} 0%, transparent 80%)` }} />

      {/* 1. Header Area */}
      <div className="result-top-bar glass-card">
        <div className="company-branding">
          <div className="branding-icon"><Building size={20} /></div>
          <div className="branding-info">
            <h3>{company}</h3>
            <p>{role}</p>
          </div>
        </div>
        <div className="analysis-meta">
          <div className="meta-item"><Clock size={12} /> {analysisTime}s</div>
          <div className="meta-item"><Cpu size={12} /> AI/NLP</div>
          {platform && <div className="meta-item platform-tag">{platform}</div>}
        </div>
      </div>

      {/* 2. Main Verdict Section */}
      <div className="verdict-section glass-card" style={{ borderLeft: `4px solid ${config.color}` }}>
        <div className="verdict-left">
           <div className="risk-score-display" style={{ color: config.color }}>
              <span className="score-num">{score}</span>
              <span className="score-label">RISK SCORE</span>
           </div>
        </div>
         <div className="verdict-middle">
            <div className="verdict-header-badge">GARUDA-X ANALYSIS</div>
            <div className="verdict-badge" style={{ background: config.color }}>
               <VerdictIcon size={16} />
               {config.label} ({risk_level})
            </div>
            
            <div className="risk-meter-container">
               <div className="risk-meter-bar">
                  <div className="risk-meter-fill" style={{ width: `${score}%`, background: config.color }} />
               </div>
            </div>

            <p className="verdict-msg">{message}</p>
            
            {signals.length > 0 && (
              <div className="signal-tags">
                <h5>Detected Signals:</h5>
                <div className="tags-container">
                  {signals.map((s, i) => (
                    <span key={i} className="signal-tag">• {s}</span>
                  ))}
                </div>
              </div>
            )}
         </div>
        <div className="verdict-right">
           <div className="tier-viz">
              {[1,2,3,4,5].map(t => (
                <div 
                  key={t} 
                  className={`tier-step ${t <= config.tier ? 'active' : ''}`}
                  style={{ background: t <= config.tier ? config.color : 'rgba(255,255,255,0.05)' }}
                />
              ))}
           </div>
           <span className="tier-text">Tier {config.tier} Threat</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="result-tabs">
        <button className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
          <Layout size={14} /> Insights
        </button>
        <button className={`tab-btn ${activeTab === 'evidence' ? 'active' : ''}`} onClick={() => setActiveTab('evidence')}>
          <AlertTriangle size={14} /> Risk Data
        </button>
        <button className={`tab-btn ${activeTab === 'deep' ? 'active' : ''}`} onClick={() => setActiveTab('deep')}>
          <Zap size={14} /> AI Analysis
        </button>
        {extractedText && (
          <button className={`tab-btn ${activeTab === 'ocr' ? 'active' : ''}`} onClick={() => setActiveTab('ocr')}>
            <Eye size={14} /> OCR Source
          </button>
        )}
      </div>

      {/* 4. Tab Content Area */}
      <div className="tab-viewport glass-card">
        
        {activeTab === 'summary' && (
          <div className="tab-pane animate-fade-in">
             <div className="summary-grid">
                <div className="summary-block">
                   <h4><ShieldAlert size={14} /> Safety Protocol</h4>
                   <ul className="safety-list">
                      {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                   </ul>
                </div>
                <div className="summary-block">
                   <h4><TrendingUp size={14} /> Key Observations</h4>
                   <div className="observation-cloud">
                      {flags.map(kw => <span key={kw} className="obs-tag dangerous">{kw}</span>)}
                      {flags.length === 0 && <span className="obs-tag safe">No major red flags</span>}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="tab-pane animate-fade-in">
             <div className="evidence-viewer">
                {suspiciousPhrases.length > 0 ? (
                  <div className="phrase-list">
                     {suspiciousPhrases.map((p, i) => (
                       <div key={i} className="evidence-row">
                          <span className="evidence-badge">FLAG</span>
                          <div className="evidence-text">
                             <strong>{p.keyword}:</strong> "{p.context}"
                          </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="empty-state">
                     <CheckCircle size={40} color="var(--accent2)" />
                     <p>No suspicious language patterns detected.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'deep' && (
          <div className="tab-pane animate-fade-in">
             <div className="deep-analysis-grid">
                <div className="category-list">
                   {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => {
                     const val = categoryRisks ? (categoryRisks[key] || 0) : 0;
                     return (
                       <div key={key} className="cat-metric">
                          <div className="cat-head">
                             <span>{icon} {label}</span>
                             <span>{val}%</span>
                          </div>
                          <div className="cat-track"><div className="cat-fill" style={{ width: `${val}%` }} /></div>
                       </div>
                     )
                   })}
                </div>
                <div className="heuristic-list">
                   {breakdown && Object.entries(breakdown).map(([key, val]) => (
                     <div key={key} className="h-point">
                        <span className="h-label">{key.replace('_', ' ')}</span>
                        <div className="h-dot-list">
                           {[...Array(10)].map((_, i) => (
                             <div key={i} className={`h-dot ${i < val/10 ? 'lit' : ''}`} />
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'ocr' && (
          <div className="tab-pane animate-fade-in">
             <div className="ocr-raw-view">
                <pre>{extractedText}</pre>
             </div>
          </div>
        )}
      </div>

      {/* 5. Footer Actions */}
      <div className="result-actions-row">
        <button className="btn-primary analyze-again" onClick={onNewAnalysis}>
          <RefreshCw size={18} /> New Analysis
        </button>
        <button className="btn-secondary" onClick={handleExport} disabled={exportLoading}>
          <Download size={18} /> {exportLoading ? 'Working...' : 'Risk Report'}
        </button>
        <button className="btn-secondary" onClick={handleShare}>
          <Share2 size={18} /> Warn Others
        </button>
        <div className="spacer" />
        <button className="report-flag-btn" onClick={() => window.open('https://cybercrime.gov.in/', '_blank')}>
           <ShieldAlert size={16} /> Report Scam
        </button>
      </div>

    </div>
  );
};

export default ResultCard;
