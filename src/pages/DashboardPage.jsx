import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

const COLORS = {
  genuine: '#10b981',
  suspicious: '#f59e0b',
  fake: '#ef4444',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: 8, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: COLORS[p.name] || p.color, fontSize: '0.82rem', marginBottom: 4 }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { history } = useApp();

  // 1. Core Stats
  const stats = {
    total: history.length,
    genuine: history.filter(h => h.risk === 'genuine').length,
    suspicious: history.filter(h => h.risk === 'suspicious').length,
    fake: history.filter(h => h.risk === 'fake').length,
  };

  const avgConfidence = history.length
    ? Math.round(history.reduce((acc, h) => acc + (h.confidence || 0), 0) / history.length)
    : 0;

  // 2. Dynamic Trend Data (Grouped by date)
  const getTrendData = () => {
    const lastDates = [...new Set(history.map(h => h.date))].sort().slice(-7);
    if (lastDates.length === 0) return [{ name: 'No Data', genuine: 0, suspicious: 0, fake: 0 }];
    
    return lastDates.map(date => ({
      name: date.split('-').slice(1).join('/'),
      genuine: history.filter(h => h.date === date && h.risk === 'genuine').length,
      suspicious: history.filter(h => h.date === date && h.risk === 'suspicious').length,
      fake: history.filter(h => h.date === date && h.risk === 'fake').length,
    }));
  };

  const trendData = getTrendData();

  // 3. Category Pie Chart
  const pieData = [
    { name: 'Genuine', value: stats.genuine, color: COLORS.genuine },
    { name: 'Suspicious', value: stats.suspicious, color: COLORS.suspicious },
    { name: 'Fake', value: stats.fake, color: COLORS.fake },
  ].filter(d => d.value > 0);

  const STAT_CARDS = [
    { label: 'Total Scans', value: stats.total, icon: Shield, color: 'var(--accent-blue)', bg: 'rgba(99,179,237,0.1)' },
    { label: 'Genuine', value: stats.genuine, icon: CheckCircle, color: COLORS.genuine, bg: 'rgba(16,185,129,0.1)' },
    { label: 'Suspicious', value: stats.suspicious, icon: AlertTriangle, color: COLORS.suspicious, bg: 'rgba(245,158,11,0.1)' },
    { label: 'Fake / Scam', value: stats.fake, icon: XCircle, color: COLORS.fake, bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div className="dashboard-page scale-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <TrendingUp size={24} />
            Analytics Dashboard
          </h1>
          <p className="page-desc">Real-time breakdown of your detected internship profiles.</p>
        </div>
        <Link to="/analyze" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          New Analysis <ArrowRight size={16} />
        </Link>
      </div>

      {stats.total === 0 ? (
        <div className="empty-dashboard glass-card">
          <Shield size={48} color="var(--accent)" />
          <h2>No Analysis History</h2>
          <p>Scanned internships will appear here with detailed risk charts.</p>
          <Link to="/analyze" className="btn-primary">Start First Scan</Link>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="stat-widget glass-card">
                <div className="stat-widget-icon" style={{ background: bg, color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="stat-widget-value" style={{ color }}>{value}</div>
                  <div className="stat-widget-label">{label}</div>
                </div>
                <div className="stat-widget-bar" style={{ background: bg }}>
                  <div
                    className="stat-widget-fill"
                    style={{ width: `${stats.total ? (value / stats.total) * 100 : 0}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            <div className="glass-card chart-card">
              <h3 className="chart-title">Detection Trend</h3>
              <p className="chart-sub">Recent scan results over time</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="smooth" dataKey="genuine" stroke={COLORS.genuine} strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="smooth" dataKey="suspicious" stroke={COLORS.suspicious} strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="smooth" dataKey="fake" stroke={COLORS.fake} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {Object.entries(COLORS).map(([key, color]) => (
                  <div key={key} className="legend-item">
                    <div className="legend-dot" style={{ background: color }} />
                    <span style={{ textTransform: 'capitalize' }}>{key}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card chart-card">
              <h3 className="chart-title">Risk Proportion</h3>
              <p className="chart-sub">Overall history breakdown</p>
              {pieData.length > 0 ? (
                <div className="pie-wrapper">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-center-stat">
                    <div className="pie-stat-value">{avgConfidence}%</div>
                    <div className="pie-stat-label">Avg Conf</div>
                  </div>
                </div>
              ) : (
                <div className="pie-empty">Not enough data</div>
              )}
            </div>

            <div className="glass-card chart-card wide-card">
              <h3 className="chart-title">Daily Scan Volume</h3>
              <p className="chart-sub">Distribution of results by day</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="genuine" fill={COLORS.genuine} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="suspicious" fill={COLORS.suspicious} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fake" fill={COLORS.fake} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {history.length > 0 && (
        <div className="glass-card recent-card">
          <div className="recent-header">
            <h3 className="chart-title" style={{ margin: 0 }}>Recent Analyses</h3>
            <Link to="/history" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="recent-list">
            {history.slice(0, 4).map(item => (
              <div key={item.id} className="recent-item">
                <div className={`recent-risk-dot ${item.risk || 'suspicious'}`} />
                <div className="recent-info">
                  <p className="recent-company">{item.company || 'Unknown'}</p>
                  <p className="recent-role">{item.role || 'Career Analysis'}</p>
                </div>
                <div className="recent-right">
                  <span className={`badge badge-${item.risk || 'suspicious'}`}>{item.risk || 'SUSPICIOUS'}</span>
                  <span className="recent-conf" style={{ color: COLORS[item.risk] }}>{item.confidence || item.score || 0}%</span>
                  <span className="recent-date">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
