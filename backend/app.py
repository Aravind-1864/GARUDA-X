"""
GARUDA X – Fake Internship Detector
Flask Backend API — Enhanced v2.0
5-Category Risk Scoring | 5-Tier Verdict System | Phrase Highlighting
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import joblib
import cv2
import numpy as np
import pytesseract
import os
import sys
from datetime import datetime

# Add current directory to path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pattern_detector import calculate_combined_risk, analyze_structure

reader = None
try:
    import easyocr
    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
except Exception as e:
    print(f"Could not initialize easyocr: {e}")

app = Flask(__name__)
CORS(app)

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = None
vectorizer = None
try:
    model_path = os.path.join(BASE_DIR, 'garuda_model.pkl')
    vec_path = os.path.join(BASE_DIR, 'garuda_vectorizer.pkl')
    model = joblib.load(model_path)
    vectorizer = joblib.load(vec_path)
except Exception as e:
    print(f"Warning: Could not load ML model: {e}")

# ─── 5-Category Keyword Lists ────────────────────────────────────────────────

PAYMENT_KEYWORDS = [
    'pay fees', 'registration charge', 'training fee', 'deposit required',
    'registration fee', 'pay to join', 'refundable deposit', 'security deposit',
    'fee required', 'kyc fee', 'processing fee', 'activation fee',
    'pay rs', 'pay inr', 'pay rupees', 'charge fee', 'onboarding fee',
    'joining fee', 'subscription fee', 'document fee', 'kit fee',
    'kit charge', 'verification fee', 'security kit', 'payment of',
    'pay only', 'refundable amount', 'refundable fee', 'admin fee',
    'application fee', 'small fee', 'deposit fee', 'investment',
    'processing charge', 'security amount', 'earn by paying'
]

PAYMENT_KEYWORDS_SIMPLE = ['pay', 'payment', 'fees', 'deposit', 'charge', 'amount', 'registration']

MANIPULATION_KEYWORDS = [
    'urgent', 'urgently', 'hurry', 'limited seats', 'last chance',
    'apply now urgently', 'act fast', 'today only', 'expires soon',
    'share this message', 'share this group link', 'forward this',
    'whatsapp group', 'telegram group', 'add your friends', 'refer friends',
    'urgent hiring', 'immediate joining', 'slots left', 'contact urgently'
]

RECRUITER_DISTRUST_KEYWORDS = [
    'whatsapp only', 'on whatsapp', 'telegram only', 'on telegram',
    'no interview', 'direct selection', 'instant selection',
    'lottery selection', 'selected randomly', 'auto selected', 'system selected',
    'no qualification', 'anyone can apply', 'no degree',
    'gmail.com recruiter', 'yahoo.com recruiter', 'hotmail recruiter',
    'direct recruitment', 'appointment letter', 'onboarding training',
    'whatsapp us', 'contact on whatsapp'
]

COMPANY_DISTRUST_KEYWORDS = [
    'work from home guaranteed', 'earn from home', 'home based job',
    'mlm', 'multi level marketing', 'refer and earn', 'network marketing',
    'chain marketing', 'pyramid scheme', 'downline', 'upline',
    'own boss', 'be your own boss', 'passive income guaranteed',
    'referral scheme', 'commission basis', 'member selection', 'recruit people',
    'recruitment fee', 'security deposit refundable', 'recruit 5 people',
    'refer 10 friends', 'refer friends'
]

UNREALISTIC_KEYWORDS = [
    'earn up to 50000', 'earn lakhs', 'unlimited income', 'earn crores', 'earn daily',
    '100% placement', 'guaranteed job', 'guaranteed placement', 'guaranteed income',
    'no qualification needed', 'no degree needed', 'earn weekly 50', 'no experience',
    'earn monthly lakh', '100% job guarantee', 'assured income', 'income guarantee',
    'immediate joining bonus', 'joining bonus guaranteed', 'earn while sleeping',
    'earn 25000 daily', '80000/month guaranteed', '10000 weekly stipend',
    'no skills needed', 'earn while you learn', 'work from home copy paste',
    'easy money', 'earn 5000', 'earn 2000 daily'
]

GENUINE_SIGNALS = [
    'certificate provided', 'letter of recommendation', 'lor provided',
    'github portfolio', 'technical interview', 'coding test', 'assignment round',
    'background verification', 'stipend of', 'official email', 'registered company',
    'gst number', 'cin number', 'company registration', 'hr team', 'offer letter',
    'linkedin profile', 'glassdoor', 'naukri', 'indeed', 'internshala',
    'video interview', 'telephonic interview', 'aptitude test', 'group discussion',
    'government portal', 'official careers portal', 'background check'
]

SOURCE_RISK = {
    'whatsapp': 25,
    'telegram': 20,
    'linkedin': -10,
    'email': -5,
    'naukri': -10,
    'internshala': -10,
    'other': 5
}

# ─── Helper Functions ─────────────────────────────────────────────────────────

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

RELEVANCE_KEYWORDS = [
    'internship', 'intern', 'job', 'hiring', 'recruitment', 'role', 'position',
    'stipend', 'salary', 'working', 'apply', 'application', 'candidate', 'cv',
    'resume', 'interview', 'selection', 'placement', 'offer letter', 'work',
    'opportunity', 'career', 'student', 'graduate', 'freshers', 'earn', 'income',
    'pvt ltd', 'registration fee', 'training fee', 'selected', 'recruiting'
]

def is_internship_related(text):
    """Check if the text has any job/internship relevance."""
    text_lower = text.lower()
    matches = [kw for kw in RELEVANCE_KEYWORDS if kw in text_lower]
    return len(matches) >= 1  # At least one job-related word

def find_phrases(text, keywords):
    """Return matched keywords found in text."""
    text_lower = text.lower()
    found = []
    for kw in keywords:
        if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
            found.append(kw)
    return found

def find_phrases_with_context(text, keywords, window=40):
    """Return suspicious phrases with their surrounding context."""
    text_lower = text.lower()
    highlights = []
    for kw in keywords:
        for match in re.finditer(r'\b' + re.escape(kw) + r'\b', text_lower):
            start = max(0, match.start() - window)
            end = min(len(text), match.end() + window)
            snippet = text[start:end]
            if snippet not in highlights:
                highlights.append({
                    'keyword': kw,
                    'context': f"...{snippet}..." if start > 0 else f"{snippet}..."
                })
    return highlights[:10]

def score_categories(text, source_platform='other'):
    """Score all 5 risk categories, each 0-100."""
    text_lower = text.lower()

    # 1. Payment Risk
    payment_hits = find_phrases(text, PAYMENT_KEYWORDS)
    simple_hits = [kw for kw in PAYMENT_KEYWORDS_SIMPLE
                   if re.search(r'\b' + re.escape(kw) + r'\b', text_lower)]
    payment_score = min(100, len(payment_hits) * 55 + len(simple_hits) * 20)

    # 2. Manipulation Language Risk
    manip_hits = find_phrases(text, MANIPULATION_KEYWORDS)
    exclamations = min(text.count('!'), 5)
    caps_words = len(re.findall(r'\b[A-Z]{3,}\b', text))
    manip_score = min(100, len(manip_hits) * 22 + exclamations * 5 + caps_words * 3)

    # 3. Recruiter Authenticity Risk
    recruiter_hits = find_phrases(text, RECRUITER_DISTRUST_KEYWORDS)
    source_score = SOURCE_RISK.get(source_platform.lower(), 5)
    recruiter_score = min(100, max(0, len(recruiter_hits) * 28 + source_score))

    # 4. Company Trust Risk (Scam hits are more powerful than genuine signals)
    company_hits = find_phrases(text, COMPANY_DISTRUST_KEYWORDS)
    genuine_hits = find_phrases(text, GENUINE_SIGNALS)
    company_score = min(100, max(0, len(company_hits) * 60 - len(genuine_hits) * 15))

    # 5. Unrealistic Offer Risk
    unreal_hits = find_phrases(text, UNREALISTIC_KEYWORDS)
    unreal_score = min(100, len(unreal_hits) * 50)

    return {
        'payment_risk': round(payment_score),
        'manipulation_risk': round(manip_score),
        'recruiter_risk': round(recruiter_score),
        'company_trust_risk': round(company_score),
        'unrealistic_offer_risk': round(unreal_score),
    }, {
        'payment': payment_hits,
        'manipulation': manip_hits,
        'recruiter': recruiter_hits,
        'company': company_hits,
        'unrealistic': unreal_hits,
        'genuine': genuine_hits,
    }

def compute_final_score(category_scores):
    """Weighted average of category scores with a bias towards high-risk detections."""
    weights = {
        'payment_risk': 0.40,
        'manipulation_risk': 0.10,
        'recruiter_risk': 0.10,
        'company_trust_risk': 0.15,
        'unrealistic_offer_risk': 0.25,
    }
    
    # Calculate weighted average
    weighted_avg = sum(category_scores[k] * weights[k] for k in weights)
    
    # High-Risk Booster: If any category is very high, push the total score up
    max_cat = max(category_scores.values())
    if (max_cat >= 75) or (category_scores['payment_risk'] >= 70):
        # If any major category is a red alert, the whole thing is dangerous
        final = max(weighted_avg, max_cat * 0.95, 80)
    elif max_cat >= 50:
        # Boost if moderately high
        final = max(weighted_avg, 65)
    elif max_cat > 30:
        final = max(weighted_avg, 40)
    else:
        final = weighted_avg
        
    return round(final)

def get_verdict(score):
    """5-tier verdict from score."""
    if score >= 76: return 'LIKELY_SCAM'
    if score >= 56: return 'HIGH_RISK'
    if score >= 36: return 'SUSPICIOUS'
    if score >= 16: return 'LOW_RISK'
    return 'GENUINE'

def get_risk_level(verdict):
    mapping = {
        'LIKELY_SCAM': 'High',
        'HIGH_RISK': 'High',
        'SUSPICIOUS': 'Medium',
        'LOW_RISK': 'Low',
        'GENUINE': 'Low',
    }
    return mapping.get(verdict, 'Medium')

def get_message(verdict):
    messages = {
        'LIKELY_SCAM': 'This internship is almost certainly a scam. Do NOT pay any fees, share personal documents, or respond to this recruiter.',
        'HIGH_RISK': 'This internship shows strong red flags. Very likely fraudulent. Avoid paying fees or sharing sensitive information.',
        'SUSPICIOUS': 'This internship has notable red flags. Verify the company thoroughly on official channels before proceeding.',
        'LOW_RISK': 'This internship looks mostly legitimate but verify the company independently before sharing sensitive details.',
        'GENUINE': 'This internship appears genuine. Standard precautions still apply — verify before sharing any personal information.',
    }
    return messages.get(verdict, '')

def get_recommendations(verdict, hits):
    base = []
    if verdict in ('LIKELY_SCAM', 'HIGH_RISK'):
        base += [
            'Do NOT pay any registration, training, or security fees',
            'Do NOT share Aadhaar, PAN, or bank details',
            'Report this recruiter to the platform immediately',
            'Block the sender and warn your peers',
        ]
    elif verdict == 'SUSPICIOUS':
        base += [
            'Verify company registration on MCA India portal (www.mca.gov.in)',
            'Search the company name + "scam" / "review" on Google',
            'Request an official company email (not Gmail/Yahoo)',
            'Ask for a formal offer letter before any commitment',
        ]
    else:
        base += [
            'Independently verify the company website and LinkedIn page',
            'Confirm the internship details via official company channels',
            'Never share bank or Aadhaar details without formal documentation',
        ]

    if hits['payment']:
        base.append('Never pay any fees to get an internship — legitimate companies do not charge candidates')
    if hits['recruiter']:
        base.append('Legitimate recruiters use official company email — avoid WhatsApp/Telegram-only communication')
    if hits['unrealistic']:
        base.append('Verify stipend claims — unrealistically high salaries are a common scam tactic')

    return list(dict.fromkeys(base))[:6]

# ─── Core Analysis Pipeline ───────────────────────────────────────────────────

def analyze_text_full(text, source_platform='other'):
    """Full 5-category analysis pipeline with relevance check."""
    
    # 0. Relevance Filter
    if not is_internship_related(text):
        return {
            'verdict': 'NOT_RELEVANT',
            'risk': 'Neutral',
            'score': 0,
            'message': 'This content does not appear to be related to an internship or job offer. Garuda X is specialized for career safety.',
            'flags': [],
            'genuine_signals': [],
            'fake_keywords': [],
            'suspicious_keywords': [],
            'category_risks': {k: 0 for k in ['payment_risk', 'manipulation_risk', 'recruiter_risk', 'company_trust_risk', 'unrealistic_offer_risk']},
            'breakdown': {'linguistic': 100, 'contextual': 100, 'pattern': 100},
            'recommendations': ['Please upload or paste an internship-related message or screenshot for a safety audit.'],
            'suspicious_phrases': [],
            'analysis_details': {'fake_hits': 0, 'suspicious_hits': 0, 'genuine_hits': 0, 'ml_used': False}
        }

    category_scores, keyword_hits = score_categories(text, source_platform)
    all_flags = (
        keyword_hits['payment'] + keyword_hits['manipulation'] +
        keyword_hits['recruiter'] + keyword_hits['company'] +
        keyword_hits['unrealistic']
    )

    # Calculate rule-based score first
    rule_score = compute_final_score(category_scores)
    
    # Combine with ML model if available
    ml_score = None
    if model and vectorizer:
        clean_text = preprocess_text(text)
        tfidf_vector = vectorizer.transform([clean_text])
        prediction_idx = model.predict(tfidf_vector)[0]
        proba = model.predict_proba(tfidf_vector)[0]
        ml_score = int(proba[prediction_idx] * 100)
        # Blend ML score: 40% ML, 60% rule-based
        if prediction_idx == 2:      # FAKE
            blended = round(rule_score * 0.6 + min(ml_score, 100) * 0.4)
        elif prediction_idx == 1:    # SUSPICIOUS
            blended = round(rule_score * 0.6 + (ml_score * 0.6) * 0.4)
        else:                        # GENUINE
            blended = round(rule_score * 0.7 + max(0, 100 - ml_score) * 0.1)
        final_score = max(0, min(100, blended))
    else:
        final_score = rule_score

    # Merge with new Multi-Layer Pipeline
    ml_pipeline_result = calculate_combined_risk(text, keyword_score=rule_score)
    final_score = ml_pipeline_result['risk_score']
    risk_level = ml_pipeline_result['risk_level']
    signals = ml_pipeline_result['signals']

    verdict = get_verdict(final_score)
    risk = risk_level.capitalize() # Keep consistent with frontend naming if needed
    message = get_message(verdict)
    recommendations = get_recommendations(verdict, keyword_hits)

    # Phrase highlighting
    all_suspicious_kw = (
        PAYMENT_KEYWORDS + PAYMENT_KEYWORDS_SIMPLE[:3] +
        MANIPULATION_KEYWORDS + RECRUITER_DISTRUST_KEYWORDS +
        COMPANY_DISTRUST_KEYWORDS + UNREALISTIC_KEYWORDS
    )
    suspicious_phrases = find_phrases_with_context(text, all_flags)

    # Breakdown percentages (inverted for genuine score display)
    breakdown = {
        'linguistic': max(0, 100 - category_scores['manipulation_risk']),
        'contextual': max(0, 100 - category_scores['company_trust_risk']),
        'pattern': max(0, 100 - max(
            category_scores['payment_risk'],
            category_scores['unrealistic_offer_risk']
        )),
    }

    return {
        'verdict': verdict,
        'risk': risk,
        'prediction': 'scam' if final_score > 60 else ('suspicious' if final_score > 30 else 'genuine'),
        'risk_score': final_score,
        'risk_level': risk_level,
        'score': final_score,
        'message': message,
        'signals': signals,
        'flags': list(set(all_flags)),
        'genuine_signals': keyword_hits['genuine'],
        'fake_keywords': keyword_hits['payment'] + keyword_hits['unrealistic'],
        'suspicious_keywords': keyword_hits['manipulation'] + keyword_hits['recruiter'],
        'category_risks': category_scores,
        'breakdown': breakdown,
        'warnings': recommendations,
        'recommendations': recommendations,
        'suspicious_phrases': suspicious_phrases,
        'analysis_details': {
            'fake_hits': len(keyword_hits['payment']) + len(keyword_hits['unrealistic']),
            'suspicious_hits': len(keyword_hits['manipulation']) + len(keyword_hits['recruiter']),
            'genuine_hits': len(keyword_hits['genuine']),
            'ml_used': model is not None,
            'structure': analyze_structure(text)
        }
    }

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'GARUDA X API',
        'version': '2.0.0',
        'ml_model': model is not None,
        'ocr': True
    })

@app.route('/api/analyze/text', methods=['POST'])
def analyze_text_route():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    text = data['text'].strip()
    if len(text) < 10:
        return jsonify({'error': 'Text too short for analysis'}), 400

    platform = data.get('platform', 'other')
    result = analyze_text_full(text, platform)
    result['company'] = data.get('company', 'Unknown')
    result['role'] = data.get('role', '')
    result['platform'] = platform
    result['type'] = 'text'
    result['timestamp'] = datetime.now().isoformat()
    return jsonify(result)

@app.route('/api/analyze/screenshot', methods=['POST'])
def analyze_screenshot():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']

    try:
        file_bytes = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if image is not None:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            processed = cv2.medianBlur(thresh, 3)
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            processed = cv2.filter2D(processed, -1, kernel)

            try:
                extracted_text = pytesseract.image_to_string(processed).strip()
                if not extracted_text:
                    raise Exception("Tesseract returned empty")
            except Exception:
                if reader:
                    results = reader.readtext(image)
                    extracted_text = " ".join([t for _, t, _ in results]).strip()
                else:
                    extracted_text = ""
        else:
            extracted_text = ""
    except Exception as e:
        print(f"OCR Error: {e}")
        extracted_text = ""

    if not extracted_text:
        return jsonify({'error': 'Could not extract text from the screenshot. Please try a clearer image.'}), 400

    platform = request.form.get('platform', 'other')
    result = analyze_text_full(extracted_text, platform)
    result['extracted_text'] = extracted_text
    result['company'] = request.form.get('company', 'Unknown')
    result['role'] = request.form.get('role', '')
    result['platform'] = platform
    result['type'] = 'screenshot'
    result['timestamp'] = datetime.now().isoformat()
    return jsonify(result)

@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify({'history': [], 'message': 'History is stored client-side'})

@app.route('/api/awareness', methods=['GET'])
def get_awareness_tips():
    tips = {
        'scam_types': [
            {
                'type': 'Registration Fee Scam',
                'description': 'Fake companies ask you to pay a fee to "confirm" your internship position.',
                'example': '"Pay ₹999 to secure your spot. Fully refundable after joining."',
                'severity': 'high'
            },
            {
                'type': 'Work From Home Fraud',
                'description': 'Promises of high paying work-from-home jobs with zero experience or skills required.',
                'example': '"Earn ₹50,000/week working 2 hours from home. No skills needed."',
                'severity': 'high'
            },
            {
                'type': 'WhatsApp/Telegram Scams',
                'description': 'Recruiters contact you only through messaging apps — no official email or website.',
                'example': '"Added to a WhatsApp group with 200+ people for job offers."',
                'severity': 'medium'
            },
            {
                'type': 'MLM Disguised as Internship',
                'description': 'Multi-level marketing schemes presented as marketing internships.',
                'example': '"Refer 3 friends and earn extra ₹5,000 commission."',
                'severity': 'high'
            },
            {
                'type': 'Data Harvesting Scam',
                'description': 'Fake applications asking for Aadhaar, PAN, or bank details upfront.',
                'example': '"Submit Aadhaar copy to complete registration process."',
                'severity': 'critical'
            },
        ],
        'warning_signs': [
            'Asked to pay any fee before or after selection',
            'No official company website mentioned',
            'Communication only via WhatsApp or Telegram',
            'No interview process — "direct selection"',
            'Unrealistically high stipend (₹50,000+/week for freshers)',
            'Urgent pressure to join immediately',
            'Vague job description with no specific responsibilities',
            'Recruiter uses Gmail/Yahoo instead of company email',
            'Guaranteed job/placement claims',
            'Asked to share Aadhaar/PAN before offer letter',
        ],
        'never_share': [
            'Aadhaar Card number or copy',
            'PAN Card number',
            'Bank account details or passbook',
            'CVV or OTP for any payment',
            'Passwords or login credentials',
            'Photos with personal documents',
        ],
        'verification_steps': [
            'Search the company on MCA India (mca.gov.in) to verify registration',
            'Check the company on LinkedIn — look for real employees',
            'Look up company reviews on Glassdoor or Ambitionbox',
            "Verify the recruiter's email domain matches the company website",
            'Search "[Company Name] scam" or "[Company Name] fake" on Google',
            "Ask for an official HR email and call the company's main number",
            'Check if the internship is listed on Internshala, Naukri, or LinkedIn Jobs',
        ],
        'safe_practices': [
            'Always apply through official platforms (LinkedIn, Internshala, Naukri)',
            'Never pay money to get an internship — ever',
            'Get everything in writing — offer letter, stipend, role clarity',
            'Verify before you share any personal document',
            'Trust your gut — if something feels too good to be true, it is',
            'Ask seniors or professors for a second opinion on suspicious offers',
        ]
    }
    return jsonify(tips)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
