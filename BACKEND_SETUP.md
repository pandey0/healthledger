# HealthLedger Backend Setup Guide

## Overview
The backend is a FastAPI application that handles:
- Medical report image extraction using Google Gemini AI
- Biomarker extraction with confidence scores
- Chat queries against medical history
- Health monitoring and configuration endpoints

## Prerequisites
- Python 3.10+
- Google Gemini API key (free tier available)
- pip package manager

## Installation

### 1. Get Your Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key to a safe place

### 2. Clone Backend (Separate from Frontend)
```bash
# In your home directory, create a backend folder
mkdir ~/healthledger-backend
cd ~/healthledger-backend

# Copy the backend files from this project:
# - main.py
# - requirements.txt
# - .env.example
```

### 3. Setup Environment
```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Google API key
nano .env
```

### 4. Configure CORS Origins
Update `.env` with your frontend URL:
```env
# Development
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# Production
CORS_ORIGINS=https://yourdomain.com
```

### 5. Start Backend
```bash
python main.py
```

Backend runs on `http://localhost:8000`

## API Endpoints

### Extract Report Data
**POST** `/api/extract`
- Upload a lab report image
- Returns extracted biomarkers with confidence scores

**Request:**
```bash
curl -X POST "http://localhost:8000/api/extract" \
  -F "file=@report.jpg"
```

**Response:**
```json
{
  "status": "success",
  "request_id": "uuid",
  "timestamp": "2024-01-15T10:30:00",
  "data": [
    {
      "id": "marker-1",
      "marker": "Hemoglobin",
      "value": "14.5",
      "unit": "g/dL",
      "flag": "normal",
      "confidence": 0.98
    }
  ],
  "extraction_quality": "excellent",
  "warnings": []
}
```

### Chat Query
**POST** `/api/chat`
- Query against user's medical history
- Returns factual analysis

**Request:**
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What was my glucose level?",
    "context": "Latest test: Glucose 95 mg/dL on 2024-01-15"
  }'
```

**Response:**
```json
{
  "status": "success",
  "text": "Your glucose level on January 15, 2024 was 95 mg/dL, which is within the normal fasting range.",
  "request_id": "uuid",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Health Check
**GET** `/api/health`
```bash
curl http://localhost:8000/api/health
```

### Get Configuration
**GET** `/api/config`
```bash
curl http://localhost:8000/api/config
```

## Environment Variables

```env
# Required
GOOGLE_API_KEY=your_api_key_here

# Server
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# Models
GEMINI_MODEL=gemini-2.0-flash
EXTRACTION_TEMPERATURE=0.1      # Lower = more deterministic
CHAT_TEMPERATURE=0.2

# File Upload
MAX_FILE_SIZE_MB=10
EXTRACTION_TIMEOUT=30

# Logging
LOG_LEVEL=INFO
```

## Frontend Configuration

Update your Next.js `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

For production:
```env
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

## Features

### Extraction Quality Assessment
- **Excellent (0.95+)**: Clear, unambiguous extractions
- **Good (0.80-0.94)**: Minor formatting ambiguity
- **Fair (0.70-0.79)**: Some OCR uncertainty
- **Poor (0.70-)**: Significant uncertainty (user warned)

### Automatic Retries
- Failed requests automatically retry up to 3 times
- Exponential backoff (2s, 4s, 8s)
- Prevents temporary glitches

### Request Tracking
- Each request gets unique ID for debugging
- Comprehensive logging
- Error context included

### Biomarker Confidence Scores
- Each extracted biomarker includes confidence 0-1
- Frontend shows low-confidence warnings
- Users can review/edit uncertain extractions

## Deployment

### Docker (Recommended)
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY main.py .
ENV PORT=8000
CMD ["python", "main.py"]
```

### Cloud Platforms
- **Replit**: Upload files, set env vars, run with `python main.py`
- **Heroku**: Procfile: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Railway**: Detects Python automatically
- **AWS Lambda**: Requires serverless framework setup

## Troubleshooting

### "Failed to analyze document"
- Check if image is valid (JPEG/PNG/WebP)
- Ensure Google API key is set
- Check logs for specific error

### "Extraction service temporarily unavailable"
- Backend is down or network error
- Check backend logs: `tail -f backend.log`
- Verify CORS_ORIGINS includes frontend URL

### Low extraction quality
- Use higher resolution images
- Ensure lab report is clearly visible
- Avoid shadows, glare, or damage
- Try different image format (PNG vs JPG)

### Timeout errors
- Increase EXTRACTION_TIMEOUT in .env
- Check backend system resources
- May need more powerful CPU for image processing

## Advanced Configuration

### Custom Models
Switch to different Gemini models:
```env
GEMINI_MODEL=gemini-1.5-pro  # More capable, slower
GEMINI_MODEL=gemini-2.0-flash  # Faster, lighter (default)
```

### Temperature Tuning
- **Extraction**: Keep low (0.1) for accuracy
- **Chat**: Slightly higher (0.2-0.3) for natural language

### High-Volume Deployment
- Implement request queuing
- Add caching layer (Redis)
- Scale horizontally with load balancer
- Monitor with Prometheus/Grafana

## Support & Debugging

Enable debug logging:
```env
LOG_LEVEL=DEBUG
```

View request tracking:
```bash
# All requests
curl http://localhost:8000/api/config

# Specific request
# Check console output for request_id in responses
```

## Security Notes

⚠️ **Production Checklist:**
- [ ] Set `CORS_ORIGINS` to specific frontend domain
- [ ] Use HTTPS for all connections
- [ ] Rotate API keys regularly
- [ ] Implement rate limiting
- [ ] Add authentication tokens
- [ ] Enable HTTPS in production
- [ ] Use environment secrets, not .env files
- [ ] Implement request validation
- [ ] Monitor for abuse/failures

