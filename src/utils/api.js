const API_BASE = 'https://garuda-x.onrender.com';

// ─── Raw API calls ─────────────────────────────────────────────────────────

export async function analyzeText(text, company = '', role = '', platform = 'other') {
  const res = await fetch(`${API_BASE}/api/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, company, role, platform })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Analysis failed');
  }
  return res.json();
}

export async function analyzeScreenshot(file, company = '', role = '', platform = 'other') {
  const form = new FormData();
  form.append('file', file);
  form.append('company', company);
  form.append('role', role);
  form.append('platform', platform);
  const res = await fetch(`${API_BASE}/api/analyze/screenshot`, {
    method: 'POST', body: form
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Screenshot analysis failed');
  }
  return res.json();
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

export async function getAwarenessTips() {
  const res = await fetch(`${API_BASE}/api/awareness`);
  return res.json();
}

// ─── Unified analysis entry point ─────────────────────────────────────────

export async function analyzeInternship({ text, file, company, role, platform }) {
  const startTime = Date.now();
  let raw;

  if (file) {
    raw = await analyzeScreenshot(file, company || '', role || '', platform || 'other');
  } else {
    raw = await analyzeText(text || '', company || '', role || '', platform || 'other');
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  return transformResponse(raw, { company, role, platform, elapsed });
}

// ─── Response transformer ──────────────────────────────────────────────────

function transformResponse(raw, { company, role, platform, elapsed }) {
  // Map 5-tier verdict to frontend risk level
  const verdictToRisk = {
    'LIKELY_SCAM': 'fake',
    'HIGH_RISK': 'fake',
    'SUSPICIOUS': 'suspicious',
    'LOW_RISK': 'genuine',
    'GENUINE': 'genuine',
  };

  const verdict = raw.verdict || 'SUSPICIOUS';
  const risk = verdictToRisk[verdict] || 'suspicious';
  const score = raw.score || 0;

  // Compute confidence = how certain the system is (100 - distance to threshold)
  const confidence = score;

  // Build category risk bars (0-100 where 100 = highest risk)
  const categoryRisks = raw.category_risks || {
    payment_risk: 0,
    manipulation_risk: 0,
    recruiter_risk: 0,
    company_trust_risk: 0,
    unrealistic_offer_risk: 0,
  };

  // Breakdown inverted for "trust score" display
  const breakdown = raw.breakdown || {
    linguistic: 50,
    contextual: 50,
    pattern: 50,
  };

  return {
    id: Date.now(),
    verdict,
    risk,
    score,
    confidence,
    company: raw.company || company || 'Unknown Company',
    role: raw.role || role || 'Unknown Role',
    platform: raw.platform || platform || 'other',
    type: raw.type || 'text',
    flaggedKeywords: raw.flags || [],
    genuineSignals: raw.genuine_signals || [],
    fakeKeywords: raw.fake_keywords || [],
    suspiciousKeywords: raw.suspicious_keywords || [],
    categoryRisks,
    breakdown,
    warnings: raw.warnings || raw.recommendations || [],
    recommendation: raw.message || '',
    recommendations: raw.recommendations || raw.warnings || [],
    suspiciousPhrases: raw.suspicious_phrases || [],
    extractedText: raw.extracted_text || null,
    analysisTime: elapsed,
    analysisDetails: raw.analysis_details || {},
    date: new Date().toISOString().split('T')[0],
    timestamp: raw.timestamp || new Date().toISOString(),
  };
}

// ─── Report Generator ──────────────────────────────────────────────────────

export function generateReportHTML(result) {
  const verdictColors = {
    'LIKELY_SCAM': '#ef4444',
    'HIGH_RISK': '#f97316',
    'SUSPICIOUS': '#f59e0b',
    'LOW_RISK': '#3b82f6',
    'GENUINE': '#10b981',
  };
  const color = verdictColors[result.verdict] || '#6c63ff';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>GARUDA X — Analysis Report</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
  .report { max-width: 760px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.10); }
  .header { background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); color: #fff; padding: 36px 40px; }
  .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #6c63ff, #00d4aa); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .logo-title { font-size: 1.4rem; font-weight: 800; letter-spacing: 2px; }
  .logo-sub { font-size: 0.75rem; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
  .header-meta { color: rgba(255,255,255,0.6); font-size: 0.82rem; margin-top: 8px; }
  .body { padding: 40px; }
  .verdict-banner { background: ${color}18; border: 2px solid ${color}40; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; display: flex; align-items: center; gap: 16px; }
  .verdict-badge { background: ${color}; color: #fff; font-weight: 800; font-size: 0.9rem; letter-spacing: 1px; padding: 6px 14px; border-radius: 8px; white-space: nowrap; }
  .verdict-score { font-size: 2.5rem; font-weight: 900; color: ${color}; line-height: 1; }
  .verdict-label { font-size: 0.8rem; color: #64748b; }
  .verdict-msg { color: #334155; font-size: 0.92rem; line-height: 1.6; flex: 1; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 1.5px; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-item { background: #f8fafc; border-radius: 8px; padding: 12px 16px; }
  .info-label { font-size: 0.72rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-value { font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 3px; }
  .category-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .cat-label { width: 180px; font-size: 0.82rem; color: #475569; flex-shrink: 0; }
  .cat-bar { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
  .cat-fill { height: 100%; border-radius: 4px; }
  .cat-val { width: 36px; text-align: right; font-size: 0.8rem; font-weight: 700; }
  .flags { display: flex; flex-wrap: wrap; gap: 8px; }
  .flag-chip { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 500; }
  .genuine-chip { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 500; }
  .rec-list { list-style: none; padding: 0; margin: 0; }
  .rec-item { padding: 8px 0 8px 20px; border-bottom: 1px solid #f1f5f9; font-size: 0.88rem; color: #334155; position: relative; }
  .rec-item::before { content: '→'; position: absolute; left: 0; color: ${color}; font-weight: 700; }
  .footer { background: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
  .footer-note { font-size: 0.75rem; color: #94a3b8; }
  .footer-brand { font-size: 0.78rem; font-weight: 700; color: #6c63ff; letter-spacing: 1px; }
  @media print { body { background: #fff; } .report { box-shadow: none; } }
</style>
</head>
<body>
<div class="report">
  <div class="header">
    <div class="logo">
      <div class="logo-icon">🛡️</div>
      <div>
        <div class="logo-title">GARUDA X</div>
        <div class="logo-sub">AI-Powered Internship Safety Platform</div>
      </div>
    </div>
    <div class="header-meta">Analysis Report • Generated on ${new Date().toLocaleString('en-IN')}</div>
  </div>

  <div class="body">
    <div class="verdict-banner">
      <div>
        <div class="verdict-score">${result.score}</div>
        <div class="verdict-label">Risk Score</div>
      </div>
      <div class="verdict-msg">
        <div class="verdict-badge" style="display:inline-block;margin-bottom:8px;">${result.verdict.replace('_', ' ')}</div>
        <br/>${result.recommendation}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Internship Details</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Company</div><div class="info-value">${result.company}</div></div>
        <div class="info-item"><div class="info-label">Role / Position</div><div class="info-value">${result.role || 'Not specified'}</div></div>
        <div class="info-item"><div class="info-label">Source Platform</div><div class="info-value">${result.platform || 'Unknown'}</div></div>
        <div class="info-item"><div class="info-label">Analysis Type</div><div class="info-value">${result.type === 'screenshot' ? 'Screenshot (OCR)' : 'Text Input'}</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Risk Category Breakdown</div>
      ${Object.entries(result.categoryRisks || {}).map(([key, val]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const fillColor = val >= 60 ? '#ef4444' : val >= 35 ? '#f59e0b' : '#10b981';
        return `<div class="category-row">
          <div class="cat-label">${label}</div>
          <div class="cat-bar"><div class="cat-fill" style="width:${val}%;background:${fillColor};"></div></div>
          <div class="cat-val" style="color:${fillColor};">${val}</div>
        </div>`;
      }).join('')}
    </div>

    ${result.flaggedKeywords && result.flaggedKeywords.length > 0 ? `
    <div class="section">
      <div class="section-title">Detected Red Flags (${result.flaggedKeywords.length})</div>
      <div class="flags">${result.flaggedKeywords.map(f => `<span class="flag-chip">${f}</span>`).join('')}</div>
    </div>` : ''}

    ${result.genuineSignals && result.genuineSignals.length > 0 ? `
    <div class="section">
      <div class="section-title">Trust Signals Found</div>
      <div class="flags">${result.genuineSignals.map(f => `<span class="genuine-chip">✓ ${f}</span>`).join('')}</div>
    </div>` : ''}

    <div class="section">
      <div class="section-title">Safety Recommendations</div>
      <ul class="rec-list">
        ${(result.recommendations || []).map(r => `<li class="rec-item">${r}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="footer">
    <div class="footer-note">This report is generated by AI analysis. Always verify independently.</div>
    <div class="footer-brand">GARUDA X v2.0</div>
  </div>
</div>
</body>
</html>`;
}

export function downloadReport(result) {
  const html = generateReportHTML(result);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GARUDA-X_Report_${result.company || 'Unknown'}_${result.date || 'report'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
