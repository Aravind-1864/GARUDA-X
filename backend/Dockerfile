# Use official Python 3.10 slim image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required for Tesseract OCR and OpenCV
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirement files first to leverage Docker caching
COPY requirements.txt .

# Install Python dependencies and Gunicorn (Production web server)
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Pre-download required NLTK data for the NLP engine
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('punkt_tab')"

# Copy the rest of the backend codebase into the container
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the Flask app using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
