import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import {
  Search, Trash2, Download, Filter, Calendar, Building,
  CheckCircle, AlertTriangle, XCircle, ShieldAlert, Shield,
  ArrowRight, BarChart2, RefreshCw
} from 'lucide-react';
import { downloadReport } from '../utils/api';
import './HistoryPage.css';

const VERDICT_CONFIG = {
  GENUINE:     { label: 'Genuine',      color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: CheckCircle  },
  LOW_RISK:    { label: 'Low Risk',     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: CheckCircle  },
  SUSPICIOUS:  { label: 'Suspicious',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: AlertTriangle },
  HIGH_RISK:   { label: 'High Risk',    color: '#f97316', bg: 'rgba(249,115,22,0.1)',  icon: ShieldAlert  },
  LIKELY_SCAM: { label: 'Likely Scam', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: XCircle      },
};

const RISK_FILTER_OPTIONS = [
  { value: 'all',        label: 'All',         color: 'var(--text-secondary)' },
  { value: 'genuine',    label: 'Genuine',      color: '#10b981' },
  { value: 'suspicious', label: 'Suspicious',   color: '#f59e0b' },
  { value: 'fake',       label: 'Scam / Fake',  color: '#ef4444' },
];

const PLATFORM_LABELS = {
  linkedin: '💼 LinkedIn',
  naukri: '🔵 Naukri',
  internshala: '🎓 Internshala',
  email: '📧 Email',
  whatsapp: '💬 WhatsApp',
  telegram: '✈️ Telegram',
  other: '🔗 Other',
};

const HistoryItem = ({ item, onDelete }) => {
  const verdict = item.verdict || (item.risk === 'fake' ? 'LIKELY_SCAM' :
    item.risk === 'suspicious' ? 'SUSPICIOUS' : 'GENUINE');
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.SUSPICIOUS;
  const Icon = cfg.icon;

  const handleExport = (e) => {
    e.stopPropagation();
    downloadReport(item);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <div className="history-item glass-card">
      <div className="history-item-left">
        <div className="history-icon-wrap" style={{ background: cfg.bg, color: cfg.color }}>
          <Icon size={18} />
        </div>
        <div className="history-info">
          <div className="history-company">{item.company || 'Unknown Company'}</div>
          <div className="history-role">{item.role || 'Unknown Role'}</div>
          <div className="history-meta-row">
            {item.platform && (
              <span className="history-meta-tag">{PLATFORM_LABELS[item.platform] || item.platform}</span>
            )}
            <span className="history-meta-tag">
              <Calendar size={10} />
              {item.date}
            </span>
            {item.type === 'screenshot' && (
              <span className="history-meta-tag">📷 Screenshot</span>
            )}
          </div>
        </div>
      </div>

      <div className="history-item-right">
        {/* Score gauge */}
        <div className="history-score-block">
          <div className="history-score-ring" style={{ '--clr': cfg.color }}>
            <svg viewBox="0 0 54 54" width="54" height="54">
              <circle cx="27" cy="27" r="22" fill="none" stroke="var(--border)" strokeWidth="4" />
              <circle
                cx="27" cy="27" r="22"
                fill="none"
                stroke={cfg.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - (item.score || 0) / 100)}`}
                transform="rotate(-90 27 27)"
              />
            </svg>
            <div className="history-score-num" style={{ color: cfg.color }}>{item.score || 0}</div>
          </div>
        </div>

        <div
          className="history-verdict-badge"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}
        >
          {cfg.label}
        </div>

        <div className="history-actions">
          <button
            className="history-action-btn"
            title="Download report"
            onClick={handleExport}
          >
            <Download size={14} />
          </button>
          <button
            className="history-action-btn danger"
            title="Delete entry"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const { history, removeFromHistory, clearHistory, getStats } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [confirmClear, setConfirmClear] = useState(false);

  const stats = getStats();

  const filtered = useMemo(() => {
    let result = [...history];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        (item.company || '').toLowerCase().includes(q) ||
        (item.role || '').toLowerCase().includes(q) ||
        (item.platform || '').toLowerCase().includes(q)
      );
    }

    // Risk filter
    if (riskFilter !== 'all') {
      result = result.filter(item => item.risk === riskFilter);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => (b.timestamp || b.date || '').localeCompare(a.timestamp || a.date || ''));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => (a.timestamp || a.date || '').localeCompare(b.timestamp || b.date || ''));
    } else if (sortBy === 'score-high') {
      result.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sortBy === 'score-low') {
      result.sort((a, b) => (a.score || 0) - (b.score || 0));
    }

    return result;
  }, [history, searchQuery, riskFilter, sortBy]);

  const handleClearAll = () => {
    if (confirmClear) {
      clearHistory();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div className="history-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Shield size={24} />
            Analysis History
          </h1>
          <p className="page-desc">Browse, search, and manage all your past internship analyses.</p>
        </div>
        <div className="header-actions">
          <Link to="/dashboard" className="btn-ghost header-btn">
            <BarChart2 size={16} />
            Dashboard
          </Link>
          <Link to="/analyze" className="btn-primary header-btn">
            <Search size={16} />
            New Analysis
          </Link>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="history-stats-strip">
        {[
          { label: 'Total', value: stats.total, color: 'var(--accent)' },
          { label: 'Genuine', value: stats.genuine, color: '#10b981' },
          { label: 'Suspicious', value: stats.suspicious, color: '#f59e0b' },
          { label: 'Scam / Fake', value: stats.fake, color: '#ef4444' },
          { label: 'Avg Score', value: stats.avgScore, color: 'var(--text-secondary)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-strip-card glass-card">
            <div className="stat-strip-val" style={{ color }}>{value}</div>
            <div className="stat-strip-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="history-controls glass-card">
        {/* Search */}
        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            className="history-search"
            type="text"
            placeholder="Search by company, role, platform..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* Filters */}
        <div className="filter-group">
          <Filter size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <div className="filter-pills">
            {RISK_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`filter-pill ${riskFilter === opt.value ? 'active' : ''}`}
                style={riskFilter === opt.value ? { borderColor: opt.color, color: opt.color } : {}}
                onClick={() => setRiskFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="sort-group">
          <select
            className="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="score-high">Score: High → Low</option>
            <option value="score-low">Score: Low → High</option>
          </select>
        </div>

        {/* Clear All */}
        {history.length > 0 && (
          <button
            className={`clear-btn ${confirmClear ? 'confirm' : ''}`}
            onClick={handleClearAll}
          >
            <Trash2 size={13} />
            {confirmClear ? 'Confirm Clear?' : 'Clear All'}
          </button>
        )}
      </div>

      {/* Results count */}
      {searchQuery || riskFilter !== 'all' ? (
        <div className="results-count">
          Showing <strong>{filtered.length}</strong> of {history.length} analyses
          {(searchQuery || riskFilter !== 'all') && (
            <button className="reset-filter-btn" onClick={() => { setSearchQuery(''); setRiskFilter('all'); }}>
              <RefreshCw size={12} /> Reset filters
            </button>
          )}
        </div>
      ) : null}

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="history-empty glass-card">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">
            {history.length === 0 ? 'No analyses yet' : 'No results found'}
          </h3>
          <p className="empty-desc">
            {history.length === 0
              ? 'Start analyzing internship listings to build your history.'
              : 'Try adjusting your search or filter settings.'}
          </p>
          {history.length === 0 && (
            <Link to="/analyze" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Analyze Your First Internship <ArrowRight size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div className="history-list">
          {filtered.map(item => (
            <HistoryItem
              key={item.id}
              item={item}
              onDelete={removeFromHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
