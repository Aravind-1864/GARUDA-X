import React, { useEffect, useState } from 'react';
import './RiskMeter.css';

const RiskMeter = ({ risk, confidence }) => {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += 2;
        if (start <= confidence) {
          setAnimatedConfidence(start);
          requestAnimationFrame(step);
        } else {
          setAnimatedConfidence(confidence);
        }
      };
      requestAnimationFrame(step);
    }, 400);
    return () => clearTimeout(timer);
  }, [confidence]);

  const riskConfig = {
    genuine: {
      color: '#10b981',
      label: 'GENUINE',
      emoji: '✅',
      rotation: -90,
      message: 'This internship appears to be legitimate.',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    suspicious: {
      color: '#f59e0b',
      label: 'SUSPICIOUS',
      emoji: '⚠️',
      rotation: 0,
      message: 'Proceed with caution — verify all details.',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    fake: {
      color: '#ef4444',
      label: 'FAKE / SCAM',
      emoji: '🚨',
      rotation: 90,
      message: 'High risk detected — DO NOT apply.',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
    },
  };

  const config = riskConfig[risk] || riskConfig.genuine;
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (animatedConfidence / 100) * circumference;

  return (
    <div className="risk-meter-wrapper">
      {/* Circular gauge */}
      <div className="gauge-container">
        <svg viewBox="0 0 160 160" className="gauge-svg">
          {/* Background circle */}
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
          {/* Progress circle */}
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke={config.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 80 80)"
            style={{
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 8px ${config.color})`,
            }}
          />
          {/* Glow effect */}
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke={config.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 80 80)"
            opacity="0.3"
            style={{
              filter: `blur(4px)`,
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          {/* Center text */}
          <text x="80" y="70" textAnchor="middle" fill={config.color} fontSize="28" fontWeight="800" fontFamily="Syne, sans-serif">
            {animatedConfidence}%
          </text>
          <text x="80" y="88" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Syne, sans-serif" letterSpacing="2">
            CONFIDENCE
          </text>
        </svg>
      </div>

      {/* Risk label */}
      <div className="risk-label-card" style={{ background: config.bg, borderColor: config.border }}>
        <span className="risk-emoji">{config.emoji}</span>
        <span className="risk-label" style={{ color: config.color }}>{config.label}</span>
      </div>

      {/* Linear confidence bar */}
      <div className="confidence-bar-section">
        <div className="confidence-bar-header">
          <span>Risk Score</span>
          <span style={{ color: config.color }}>{animatedConfidence}%</span>
        </div>
        <div className="confidence-bar-track">
          <div
            className="confidence-bar-fill"
            style={{
              width: `${animatedConfidence}%`,
              background: `linear-gradient(90deg, ${config.color}88, ${config.color})`,
              boxShadow: `0 0 12px ${config.color}66`,
              transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          {/* Markers */}
          <div className="bar-marker" style={{ left: '33%' }} />
          <div className="bar-marker" style={{ left: '66%' }} />
        </div>
        <div className="bar-labels">
          <span style={{ color: '#10b981' }}>Low Risk</span>
          <span style={{ color: '#f59e0b' }}>Medium</span>
          <span style={{ color: '#ef4444' }}>High Risk</span>
        </div>
      </div>

      {/* Message */}
      <p className="risk-message" style={{ color: config.color }}>
        {config.message}
      </p>
    </div>
  );
};

export default RiskMeter;
