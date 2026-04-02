import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, AlertTriangle, Lock, Search, CheckCircle,
  ArrowRight, XCircle, Info, Eye, Ban, UserCheck
} from 'lucide-react';
import './AwarenessPage.css';

const SCAM_TYPES = [
  {
    emoji: '💳',
    title: 'Registration Fee Scam',
    severity: 'critical',
    description: 'The most common scam — fake companies ask you to pay a fee to "secure" your slot or complete registration.',
    example: '"Pay ₹999 registration fee. Fully refundable after joining your first project."',
    rule: 'Legitimate internships NEVER ask you to pay any fee.',
  },
  {
    emoji: '🏠',
    title: 'Work From Home Fraud',
    severity: 'critical',
    description: 'Promises of high-paying remote work with zero skills required, often involving data entry or "liking" posts.',
    example: '"Earn ₹40,000/week working 2 hours from home. No skills needed. Start immediately."',
    rule: 'Real remote internships list specific technical skills and have proper interviews.',
  },
  {
    emoji: '💬',
    title: 'WhatsApp/Telegram Scams',
    severity: 'high',
    description: 'Recruiters contact you through mass WhatsApp or Telegram messages. They never use official company emails.',
    example: '"You have been selected for our internship program! Join our WhatsApp group for further process."',
    rule: 'Real companies use official company email addresses — not Gmail, Yahoo, or messaging apps.',
  },
  {
    emoji: '🔗',
    title: 'MLM Disguised as Internship',
    severity: 'critical',
    description: 'Multi-level marketing schemes presented as "marketing internships." You earn by recruiting others, not by working.',
    example: '"Marketing intern role — earn ₹500 for every person you refer. No sales target."',
    rule: 'If earning depends on referring others, it is MLM — not an internship.',
  },
  {
    emoji: '📋',
    title: 'Data Harvesting Scam',
    severity: 'critical',
    description: 'Fake application forms collecting your Aadhaar, PAN, or bank details under the guise of "verification".',
    example: '"Upload your Aadhaar and bank passbook to complete internship verification."',
    rule: 'Never share Aadhaar, PAN, or bank details before receiving an official offer letter.',
  },
  {
    emoji: '🎲',
    title: '"Lucky Selection" Scam',
    severity: 'high',
    description: 'Claims that you were "randomly selected" or "lottery picked" for a high-paying role — designed to create excitement.',
    example: '"Congratulations! Our AI system has automatically selected your profile for our top intern role."',
    rule: 'No legitimate company selects candidates without an interview or assessment.',
  },
];

const WARNING_SIGNS = [
  { text: 'Asked to pay any fee before or after selection', severity: 'critical' },
  { text: 'No official company website mentioned', severity: 'high' },
  { text: 'Communication only via WhatsApp or Telegram', severity: 'high' },
  { text: 'No interview process — "direct selection"', severity: 'high' },
  { text: 'Unrealistically high stipend (₹50,000+/week for freshers)', severity: 'critical' },
  { text: 'Urgent pressure to join immediately', severity: 'medium' },
  { text: 'Vague job description with no specific responsibilities', severity: 'medium' },
  { text: 'Recruiter uses Gmail/Yahoo instead of company email', severity: 'high' },
  { text: 'Guaranteed job or 100% placement claims', severity: 'high' },
  { text: 'Asked to share Aadhaar/PAN before offer letter', severity: 'critical' },
  { text: '"Refer your friends" to earn extra (MLM structure)', severity: 'critical' },
  { text: 'No information about the team, office, or company', severity: 'medium' },
];

const NEVER_SHARE = [
  { icon: '🪪', text: 'Aadhaar Card number or copy', detail: 'Used for identity fraud and financial scams' },
  { icon: '🗂️', text: 'PAN Card number', detail: 'Can be misused for tax fraud' },
  { icon: '🏦', text: 'Bank account number, IFSC, or passbook', detail: 'Direct access to your money' },
  { icon: '🔐', text: 'CVV, OTP, or UPI PIN', detail: 'Can drain your bank account instantly' },
  { icon: '🔑', text: 'Passwords or login credentials', detail: 'Hands over control of your accounts' },
  { icon: '📸', text: 'Selfie with your identity document', detail: 'Used for impersonation and KYC fraud' },
];

const VERIFY_STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Search MCA India',
    desc: 'Look up the company on mca.gov.in to verify it is officially registered in India.',
  },
  {
    step: '02',
    icon: UserCheck,
    title: 'Check LinkedIn',
    desc: 'Find the recruiter on LinkedIn — real recruiters have a work history and company affiliation.',
  },
  {
    step: '03',
    icon: Eye,
    title: 'Google "Company + Scam"',
    desc: 'Search the company name with "scam", "fake", or "review". Real red flags appear quickly.',
  },
  {
    step: '04',
    icon: Info,
    title: 'Verify Email Domain',
    desc: 'Ask for an email from the official company domain. A real TechCorp HR emails from @techcorp.com.',
  },
  {
    step: '05',
    icon: CheckCircle,
    title: 'Use GARUDA X',
    desc: 'Paste the message here and let our AI detect scam patterns, red flags, and risk score instantly.',
  },
];

const SAFE_PLATFORMS = [
  { name: 'LinkedIn', icon: '💼', desc: 'Verify company page and recruiter profile' },
  { name: 'Internshala', icon: '🎓', desc: "India's top verified internship portal" },
  { name: 'Naukri.com', icon: '🔵', desc: 'Established jobs and internships portal' },
  { name: 'Unstop', icon: '🏆', desc: 'Competitions and internships for students' },
  { name: 'Glassdoor', icon: '🪟', desc: 'Check company reviews before applying' },
];

// ─── Quiz ────────────────────────────────────────────────────────────────────

const QUIZ = [
  {
    q: 'A recruiter messages you on WhatsApp saying you were "randomly selected" for a ₹50,000/month internship. What should you do?',
    options: [
      'Reply immediately and share your Aadhaar',
      'Pay the registration fee to join',
      'Ignore and report the message — this is a scam',
      'Join the WhatsApp group they mention',
    ],
    correct: 2,
    explanation: 'This is a classic scam: unsolicited WhatsApp contact + unrealistic pay + random selection. Ignore and report.'
  },
  {
    q: 'An HR email from "hr.techcorp@gmail.com" asks for your bank details for "stipend setup". What is the red flag?',
    options: [
      'The word "stipend" is suspicious',
      'Legitimate companies use official domain emails, not Gmail',
      'TechCorp is a fake company name',
      'Bank details should be shared for stipends',
    ],
    correct: 1,
    explanation: 'A real TechCorp HR would email from @techcorp.com, not @gmail.com. Never share bank details via email.'
  },
  {
    q: 'An internship offer says "No interview needed — 100% guaranteed placement after training fee payment." This is:',
    options: [
      'A great opportunity to grab quickly',
      'Likely genuine if they have a website',
      'Almost certainly a scam — legitimate internships have interviews',
      'Normal for first-year students',
    ],
    correct: 2,
    explanation: '"No interview + fee = scam" is nearly always true. Internships require interviews, not money.'
  },
];

const QuizSection = () => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === QUIZ[current].correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    setSelected(null);
    if (current + 1 >= QUIZ.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / QUIZ.length) * 100);
    return (
      <div className="quiz-result glass-card">
        <div className="quiz-result-score" style={{ color: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>
          {score}/{QUIZ.length}
        </div>
        <h3>{pct === 100 ? '🎉 Perfect! You got all right!' : pct >= 60 ? '👍 Good awareness level!' : '😬 Need more awareness!'}</h3>
        <p>{pct === 100
          ? 'You have excellent scam awareness. Share GARUDA X with your friends!'
          : 'Review the warning signs above and retake the quiz to sharpen your awareness.'
        }</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={handleRetry}>Retake Quiz</button>
      </div>
    );
  }

  const q = QUIZ[current];
  return (
    <div className="quiz-card glass-card">
      <div className="quiz-progress">
        <div className="quiz-progress-fill" style={{ width: `${((current) / QUIZ.length) * 100}%` }} />
      </div>
      <div className="quiz-num">Question {current + 1} / {QUIZ.length}</div>
      <p className="quiz-question">{q.q}</p>
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let cls = 'quiz-option';
          if (selected !== null) {
            if (i === q.correct) cls += ' correct';
            else if (i === selected && i !== q.correct) cls += ' wrong';
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={selected !== null}>
              <span className="quiz-opt-letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`quiz-explanation ${selected === q.correct ? 'correct' : 'wrong'}`}>
          <strong>{selected === q.correct ? '✓ Correct!' : '✗ Incorrect.'}</strong> {q.explanation}
          <button className="btn-ghost quiz-next-btn" onClick={handleNext}>
            {current + 1 < QUIZ.length ? 'Next Question →' : 'See Result →'}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AwarenessPage = () => {
  const [openScam, setOpenScam] = useState(null);

  return (
    <div className="awareness-page">

      {/* Hero */}
      <div className="awareness-hero glass-card">
        <div className="awareness-hero-left">
          <div className="awareness-eyebrow">
            <ShieldAlert size={14} />
            Student Safety Guide
          </div>
          <h1 className="awareness-title">
            Know the<br />
            <span className="awareness-gradient">Scam Playbook</span>
          </h1>
          <p className="awareness-desc">
            Fake internships target students who need experience. Learn exactly how these scams operate,
            what to never share, and how to verify any opportunity in minutes.
          </p>
          <div className="awareness-cta-row">
            <Link to="/analyze" className="btn-primary awareness-cta-btn">
              <Search size={16} />
              Analyze an Offer
            </Link>
            <a href="#quiz" className="btn-ghost awareness-cta-btn">
              Take the Quiz →
            </a>
          </div>
        </div>
        <div className="awareness-hero-right">
          <div className="stat-pill">
            <span className="stat-pill-num">73%</span>
            <span>of students received a suspicious offer in 2024</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-num">₹15K</span>
            <span>average money lost per scam victim</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-num">91%</span>
            <span>of scams use WhatsApp or Telegram as the first contact</span>
          </div>
        </div>
      </div>

      {/* Scam Types Grid */}
      <section className="awareness-section">
        <div className="awareness-section-header">
          <Ban size={18} color="var(--danger)" />
          <div>
            <h2 className="awareness-section-title">6 Types of Internship Scams</h2>
            <p className="awareness-section-sub">Click any card to learn how the scam works and how to spot it</p>
          </div>
        </div>
        <div className="scam-types-grid">
          {SCAM_TYPES.map((scam, i) => (
            <div
              key={i}
              className={`scam-card glass-card ${openScam === i ? 'open' : ''} severity-${scam.severity}`}
              onClick={() => setOpenScam(openScam === i ? null : i)}
            >
              <div className="scam-card-top">
                <span className="scam-emoji">{scam.emoji}</span>
                <div className="scam-title">{scam.title}</div>
                <span className={`severity-badge severity-${scam.severity}`}>
                  {scam.severity.toUpperCase()}
                </span>
              </div>
              {openScam === i && (
                <div className="scam-card-body">
                  <p className="scam-desc">{scam.description}</p>
                  <div className="scam-example">
                    <span className="scam-example-label">Example:</span>
                    <span className="scam-example-text">{scam.example}</span>
                  </div>
                  <div className="scam-rule">
                    <CheckCircle size={13} color="#10b981" />
                    <span>{scam.rule}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Warning Signs */}
      <section className="awareness-section">
        <div className="awareness-section-header">
          <AlertTriangle size={18} color="var(--warning)" />
          <div>
            <h2 className="awareness-section-title">12 Warning Signs to Watch For</h2>
            <p className="awareness-section-sub">If you see 2+ of these in one offer, run GARUDA X immediately</p>
          </div>
        </div>
        <div className="warning-signs-grid">
          {WARNING_SIGNS.map((item, i) => (
            <div key={i} className={`warning-sign-item glass-card ws-${item.severity}`}>
              <div className={`ws-dot ws-dot-${item.severity}`} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Never Share */}
      <section className="awareness-section">
        <div className="awareness-section-header">
          <Lock size={18} color="var(--accent)" />
          <div>
            <h2 className="awareness-section-title">Never Share These</h2>
            <p className="awareness-section-sub">Before an official offer letter is issued, these 6 things must stay with you</p>
          </div>
        </div>
        <div className="never-share-grid">
          {NEVER_SHARE.map((item, i) => (
            <div key={i} className="never-share-card glass-card">
              <div className="never-share-icon">{item.icon}</div>
              <div>
                <div className="never-share-text">{item.text}</div>
                <div className="never-share-detail">{item.detail}</div>
              </div>
              <div className="never-share-x"><XCircle size={16} color="var(--danger)" /></div>
            </div>
          ))}
        </div>
      </section>

      {/* Verify Steps */}
      <section className="awareness-section">
        <div className="awareness-section-header">
          <CheckCircle size={18} color="var(--success)" />
          <div>
            <h2 className="awareness-section-title">How to Verify Any Offer in 5 Steps</h2>
            <p className="awareness-section-sub">Takes less than 10 minutes — could save you from serious harm</p>
          </div>
        </div>
        <div className="verify-steps-list">
          {VERIFY_STEPS.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="verify-step glass-card">
              <div className="verify-step-num">{step}</div>
              <div className="verify-step-icon">
                <Icon size={20} />
              </div>
              <div className="verify-step-content">
                <div className="verify-step-title">{title}</div>
                <p className="verify-step-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safe Platforms */}
      <section className="awareness-section">
        <div className="awareness-section-header">
          <CheckCircle size={18} color="var(--success)" />
          <div>
            <h2 className="awareness-section-title">Safe Platforms to Apply On</h2>
            <p className="awareness-section-sub">Stick to verified, regulated platforms for finding internships</p>
          </div>
        </div>
        <div className="safe-platforms-row">
          {SAFE_PLATFORMS.map(p => (
            <div key={p.name} className="safe-platform-card glass-card">
              <div className="platform-icon-large">{p.icon}</div>
              <div className="platform-name">{p.name}</div>
              <div className="platform-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz */}
      <section className="awareness-section" id="quiz">
        <div className="awareness-section-header">
          <ShieldAlert size={18} color="var(--accent)" />
          <div>
            <h2 className="awareness-section-title">Test Your Scam Awareness</h2>
            <p className="awareness-section-sub">3 quick questions — see how scam-savvy you really are</p>
          </div>
        </div>
        <QuizSection />
      </section>

      {/* CTA */}
      <div className="awareness-cta-banner glass-card">
        <div className="cta-glow-bg" />
        <h2>Received a Suspicious Offer?</h2>
        <p>Paste the message into GARUDA X and get an AI-powered risk score in seconds — for free.</p>
        <Link to="/analyze" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: '1rem', padding: '14px 32px' }}>
          Analyze Now <ArrowRight size={18} />
        </Link>
      </div>

    </div>
  );
};

export default AwarenessPage;
