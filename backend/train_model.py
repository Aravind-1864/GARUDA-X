import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib
import re
import os
import sys

# Add current directory to path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

TRAINING_DATA = [
    ("Pay 999 registration fee to get started. No interview needed. Earn 50,000 per week from home.", "fake"),
    ("URGENT HIRING! 100% job guarantee. Send Aadhaar card. Limited seats available. WhatsApp us now.", "fake"),
    ("Work from home earn 25,000 daily. No experience needed. Pay training fee 500 only.", "fake"),
    ("Official internship at Amazon. No pay needed. Interviews next week.", "genuine"),
    ("Dear student, we are pleased to offer you a software engineering internship role at Google.", "genuine"),
    ("Join our engineering team. Stipend 15,000/month. Interview process includes 2 technical rounds.", "genuine"),
]

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def train():
    df = pd.DataFrame(TRAINING_DATA, columns=['text', 'label'])
    df['text'] = df['text'].apply(preprocess_text)
    label_map = {'genuine': 0, 'fake': 2}
    df['label_encoded'] = df['label'].map(label_map)
    
    X = df['text']
    y = df['label_encoded']
    
    vectorizer = TfidfVectorizer(ngram_range=(1, 3))
    X_tfidf = vectorizer.fit_transform(X)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_tfidf, y)
    
    joblib.dump(model, 'garuda_model.pkl')
    joblib.dump(vectorizer, 'garuda_vectorizer.pkl')
    print("Success: Model and Vectorizer saved.")

if __name__ == '__main__':
    train()
