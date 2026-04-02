import re

FREE_EMAIL_PROVIDERS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com'
]

def analyze_structure(message):
    """
    Analyzes the structure of internship messages.
    Returns a list of detected components.
    """
    components = []
    text_lower = message.lower()
    
    # Simple pattern matching for structural components
    if re.search(r'\b(dear|hello|hi|congratulations)\b', text_lower):
        components.append("Greeting")
        
    if re.search(r'\b(we are|infosys|company|startup|organization)\b', text_lower):
        components.append("Company introduction")
        
    if re.search(r'\b(internship|role|position|intern)\b', text_lower):
        components.append("Role mention")
        
    if re.search(r'\b(interview|schedule|test|round)\b', text_lower):
        components.append("Interview process")
        
    if re.search(r'\b(regards|best|sincerely|thanks)\b', text_lower):
        components.append("Professional closing")
        
    # Fake patterns
    if "selected" in text_lower and "congratulations" in text_lower:
        components.append("Instant selection")
        
    if re.search(r'\b(pay|fee|payment|charge|registration)\b', text_lower):
        components.append("Payment demand")
        
    if re.search(r'\b(urgently|limited seats|last chance|act fast)\b', text_lower):
        components.append("Urgency pressure")
        
    return components

def behavioral_analysis(message):
    """
    Calculates risk score based on behavioral patterns.
    """
    risk_score = 0
    signals = []
    text_lower = message.lower()
    
    if "congratulations" in text_lower:
        risk_score += 10
        signals.append("instant selection language")
        
    if "selected" in text_lower and "interview" not in text_lower:
        risk_score += 20
        signals.append("selection without interview")
        
    if "pay" in text_lower and "fee" in text_lower:
        risk_score += 40
        signals.append("payment request detected")
        
    if "limited seats" in text_lower or "urgently" in text_lower:
        risk_score += 15
        signals.append("urgent language")
        
    if re.search(r'\b(dear candidate|hello candidate|dear student)\b', text_lower):
        risk_score += 10
        signals.append("generic greeting")
        
    if message.count("!") > 3:
        risk_score += 5
        signals.append("excessive punctuation")
        
    return risk_score, signals

def language_quality_check(message):
    """
    Checks for grammar/quality red flags.
    """
    risk_score = 0
    # Simple heuristics for language quality
    if len(re.findall(r'[A-Z]{3,}', message)) > 5:
        risk_score += 10  # Excessive CAPS
        
    return risk_score

def message_length_analysis(message):
    """
    Analyzes message length and its impact on risk.
    """
    risk_score = 0
    word_count = len(message.split())
    
    if word_count < 25:
        risk_score += 20
    elif word_count < 40 and ("fee" in message.lower() or "pay" in message.lower()):
        risk_score += 25
        
    if word_count > 80:
        risk_score -= 10
        
    return risk_score

def email_domain_verification(message):
    """
    Extracts email domains and checks against free providers.
    """
    risk_score = 0
    signals = []
    emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', message)
    
    for email in emails:
        domain = email.split('@')[-1].lower()
        if domain in FREE_EMAIL_PROVIDERS:
            risk_score += 20
            signals.append("suspicious email domain")
            break # only add once
            
    return risk_score, signals

def calculate_combined_risk(message, keyword_score=0):
    """
    Combines all signals to compute a final risk score.
    Used by the main risk engine.
    """
    risk_score = 0
    signals = []
    
    # Keyword Score (passed from existing logic)
    risk_score += keyword_score
    if keyword_score > 30:
        signals.append("high density of scam keywords")
    
    # Behavioral Analysis
    behavior_score, behavior_signals = behavioral_analysis(message)
    risk_score += behavior_score
    signals.extend(behavior_signals)
    
    # Language Quality
    lang_score = language_quality_check(message)
    risk_score += lang_score
    if lang_score > 0:
        signals.append("poor language quality")
        
    # Domain Verification
    domain_score, domain_signals = email_domain_verification(message)
    risk_score += domain_score
    signals.extend(domain_signals)
    
    # Message Length
    length_score = message_length_analysis(message)
    risk_score += length_score
    if length_score > 15:
        signals.append("very short message")
    elif length_score < 0:
        signals.append("detailed professional structure")
        
    # Cap score at 100
    final_score = max(0, min(100, risk_score))
    
    # Risk Level Classification
    if final_score <= 30:
        risk_level = "LOW"
    elif final_score <= 60:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"
        
    return {
        "risk_score": final_score,
        "risk_level": risk_level,
        "signals": list(dict.fromkeys(signals)) # Remove duplicates
    }
