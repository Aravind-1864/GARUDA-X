import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, XCircle, ChevronRight, Search } from 'lucide-react';
import './HistoryPanel.css';

const riskConfig = {
  genuine: { icon: CheckCircle, color: 'var(--accent-green)', label: 'Genuine', class: 'genuine' },
  suspicious: { icon: AlertTriangle, color: 'var(--accent-orange)', label: 'Suspicious', class: 'suspicious' },
  fake: { icon: XCircle, color: 'var(--accent-red)', label: 'Fake', class: 'fake' },
};

const HistoryPanel = () => {
  const { history } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = history.filter(h => {
    const matchesFilter = filter === 'all' || h.risk === filter;
    const matchesSearch = h.company.toLowerCase().includes(search.toLowerCase()) ||
      h.role.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: history.length,
    genuine: history.filter(h => h.risk === 'genuine').length,
    suspicious: history.filter(h => h.risk === 'suspicious').length,
    fake: history.filter(h => h.risk === 'fake').length,
  };

  return (
    <div className="history-panel">
      {/* Search & Filter */}
      <div className="history-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All' },
            { key: 'genuine', label: 'Genuine' },
            { key: 'suspicious', label: 'Suspicious' },
            { key: 'fake', label: 'Fake' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`filter-tab ${filter === key ? 'active' : ''} ${key !== 'all' ? key : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="tab-count">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* History list */}
      <div className="history-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No records found</p>
          </div>
        ) : (
          filtered.map((item, i) => {
            const { icon: Icon, color, label, class: cls } = riskConfig[item.risk];
            return (
              <div
                key={item.id}
                className="history-item glass-card"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="history-item-left">
                  <div className={`history-icon ${cls}`}>
                    <Icon size={16} />
                  </div>
                  <div className="history-info">
                    <p className="history-company">{item.company}</p>
                    <p className="history-role">{item.role}</p>
                    {item.snippet && (
                      <p className="history-snippet">{item.snippet.slice(0, 80)}...</p>
                    )}
                  </div>
                </div>
                <div className="history-item-right">
                  <span className={`badge badge-${cls}`}>
                    <Icon size={10} />
                    {label}
                  </span>
                  <div className="confidence-mini">
                    <div className="conf-bar">
                      <div
                        className="conf-bar-fill"
                        style={{ width: `${item.confidence}%`, background: color }}
                      />
                    </div>
                    <span style={{ color }}>{item.confidence}%</span>
                  </div>
                  <p className="history-date">{item.date}</p>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
