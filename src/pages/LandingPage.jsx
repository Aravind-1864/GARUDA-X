import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Eye, Brain, ArrowRight, CheckCircle, Star } from 'lucide-react';
import './LandingPage.css';

const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '99, 179, 237' : '124, 58, 237',
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();

        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x, dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 179, 237, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
};

const FEATURES = [
  { icon: Brain, title: '5-Category Risk Scoring', desc: 'Advanced NLP pattern matching across 5 risk categories including manipulative language and unrealistic offers.' },
  { icon: Eye, title: 'OCR Screenshot Scanning', desc: 'Upload screenshots and let AI extract and analyze text automatically using Tesseract OCR.' },
  { icon: Shield, title: '5-Tier Threat Verdicts', desc: 'Get precise threat levels from Genuine to Likely Scam with detailed actionable recommendations.' },
  { icon: Zap, title: 'Exportable Reports', desc: 'Download comprehensive HTML risk reports instantly to share or report suspicious activity.' },
];

const STATS = [
  { value: '10K+', label: 'Internships Analyzed' },
  { value: '97%', label: 'Detection Accuracy' },
  { value: '2.3s', label: 'Avg Analysis Time' },
  { value: '500+', label: 'Students Protected' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', college: 'IIT Delhi', text: 'GARUDA X saved me from a ₹999 registration fee scam. The AI flagged it instantly!', rating: 5 },
  { name: 'Arjun Mehta', college: 'VIT Vellore', text: 'I was suspicious about an offer — GARUDA X confirmed it was fake within seconds.', rating: 5 },
  { name: 'Aisha Khan', college: 'BITS Pilani', text: 'Best tool for students. The confidence score helped me decide to apply safely.', rating: 5 },
];

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="hero-section">
        <ParticleField />
        <div className="hero-content">
          <div className="hero-badge animate-fade-up">
            <Shield size={14} />
            <span>AI-Powered Student Safety Platform</span>
          </div>
          <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Detect Fake Internships
            <br />
            <span className="gradient-text">Before They Deceive You</span>
          </h1>
          <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.2s' }}>
            GARUDA X uses Machine Learning, NLP, and OCR to protect students from fraudulent
            internship listings. Get a risk assessment in seconds — for free.
          </p>
          <div className="hero-cta animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/analyze" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
              Analyze Now <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="btn-ghost" style={{ padding: '14px 28px' }}>
              View Dashboard
            </Link>
          </div>
          <div className="hero-trust animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <CheckCircle size={14} color="var(--accent-green)" />
            <span>Free for students</span>
            <span className="dot-sep">•</span>
            <CheckCircle size={14} color="var(--accent-green)" />
            <span>No sign-up required</span>
            <span className="dot-sep">•</span>
            <CheckCircle size={14} color="var(--accent-green)" />
            <span>Instant results</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        {STATS.map(({ value, label }) => (
          <div key={label} className="stat-card glass-card">
            <div className="stat-value gradient-text">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <p className="section-eyebrow">HOW IT WORKS</p>
          <h2 className="section-title">AI-Powered Protection <span className="gradient-text">Stack</span></h2>
          <p className="section-desc">Combining multiple AI technologies for maximum accuracy and reliability.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="feature-card glass-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">
                <Icon size={22} />
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <p className="section-eyebrow">STUDENT STORIES</p>
          <h2 className="section-title">Trusted by <span className="gradient-text">Students</span></h2>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map(({ name, college, text, rating }) => (
            <div key={name} className="testimonial-card glass-card">
              <div className="stars">
                {Array(rating).fill(0).map((_, i) => <Star key={i} size={14} fill="var(--accent-orange)" color="var(--accent-orange)" />)}
              </div>
              <p className="testimonial-text">"{text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{name[0]}</div>
                <div>
                  <p className="testimonial-name">{name}</p>
                  <p className="testimonial-college">{college}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-banner-inner glass-card">
          <div className="cta-glow" />
          <h2>Ready to Stay Safe?</h2>
          <p>Join thousands of students using GARUDA X to verify internships before applying.</p>
          <Link to="/analyze" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Start Analyzing Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

// Mini icons for floating cards
const XIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>;

export default LandingPage;
