# 🦅 GARUDA X – Fake Internship Detector

> India's first AI-powered student safety platform to detect fraudulent internship offers using NLP, Machine Learning, and OCR.

---

## 🚀 Quick Start

### Frontend (React)
```bash
npm install
npm start
# Opens at http://localhost:3000
```

### Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs at http://localhost:5000
```

---

## 🏗 Architecture

```
GARUDA X
├── src/
│   ├── components/
│   │   ├── Navbar.js          # Top navigation + dark/light toggle
│   │   ├── InputAnalyzer.js   # Main analysis interface
│   │   ├── ResultCard.js      # Risk result display with highlighted keywords
│   │   ├── RiskMeter.js       # Animated SVG confidence ring
│   │   └── HistoryPanel.js    # Dashboard with charts and history
│   ├── pages/
│   │   ├── LandingPage.js     # Hero + particle animation + typing demo
│   │   ├── AnalyzerPage.js    # Text/Screenshot analyzer
│   │   └── DashboardPage.js   # Analytics dashboard
│   ├── context/
│   │   ├── ThemeContext.js    # Dark/light mode global state
│   │   └── AppContext.js      # Prediction history global state
│   └── App.js                 # Root with routing logic
└── backend/
    ├── app.py                 # Flask API with NLP scoring
    └── requirements.txt
```

---

## 🧠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, CSS3 (Glassmorphism), Recharts |
| Animations | CSS Keyframes, Canvas Particles |
| Backend | Python Flask, Flask-CORS |
| NLP | Rule-based TF-IDF, keyword scoring |
| ML (Production) | Scikit-learn, Logistic Regression |
| OCR | Tesseract / EasyOCR |
| State | React Context API + Hooks |

---

## ✨ Features
- 🎨 Dark/Light mode toggle
- ⚡ Animated typing demo on landing page
- 📊 Particle network canvas background
- 🔴🟠🟢 Color-coded risk detection (High/Medium/Low)
- 📈 Recharts analytics dashboard (bar + pie charts)
- 🖼 Drag & drop screenshot upload with OCR
- 🔍 Suspicious keyword highlighting in results
- 📱 Fully responsive for mobile & desktop

---

## 📝 Resume Description

**GARUDA X – AI Internship Safety Platform** | React, Python Flask, NLP, ML
- Designed and built a full-stack AI-powered platform to detect fraudulent internship offers using NLP keyword analysis, TF-IDF scoring, and ML classification
- Developed a premium glassmorphism React UI with dark/light mode, animated particle canvas, SVG confidence rings, and drag-and-drop OCR screenshot upload
- Integrated Flask REST API with CORS, OCR text extraction, and real-time risk scoring (High/Medium/Low) returned as dynamic UI updates without page reload
- Built analytics dashboard using Recharts with bar charts, pie charts, and filtered history panel showing detection trends across 5 risk metrics
