# GARUDA X Backend Setup

## Install dependencies
```bash
pip install -r requirements.txt
```

## For OCR support (Tesseract)
- Ubuntu: `sudo apt install tesseract-ocr`
- Windows: Download installer from https://github.com/tesseract-ocr/tesseract

## Run the server
```bash
python app.py
```
Server runs at http://localhost:5000

## API Endpoints
- GET  /api/health           → Health check
- POST /api/analyze/text     → Analyze internship text
- POST /api/analyze/screenshot → Analyze screenshot via OCR
- GET  /api/history          → Get analysis history

## ML Enhancement (Production)
Replace rule-based scoring with trained scikit-learn classifier:
```python
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

model = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1,2))),
    ('clf', LogisticRegression())
])
model.fit(X_train, y_train)
```
