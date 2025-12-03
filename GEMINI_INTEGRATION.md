# Gemini API Integration for Feature Extraction

## Overview
The recommendation system now uses Google's Gemini AI to intelligently extract valid product features from natural language queries.

## How It Works

1. **User enters natural language query** (e.g., "I want a phone with good battery and camera")
2. **Gemini AI processes the query** and extracts only valid features from `mobile_features.txt`
3. **Validated features** are sent to the PRUS recommendation algorithm
4. **Results** are ranked and displayed

## Features

- ✅ Natural language query processing
- ✅ Intelligent feature extraction using Gemini 2.5 Flash
- ✅ Validation against known features from `mobile_features.txt`
- ✅ Fallback to keyword matching if Gemini API fails
- ✅ Updated UI with better example queries

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. API Key
The Gemini API key is already configured in `recommendation_api.py`:
```python
GEMINI_API_KEY = "AIzaSyBc0Hx7j95RkGJkCJlj3JTW1UE0qUp2tqw"
```

### 3. Run the API
```bash
python recommendation_api.py
```

### 4. Open the Demo
Open `recommendation-demo.html` in your browser.

## Testing

Test the Gemini integration:
```bash
python test_gemini_features.py
```

Check available models:
```bash
python check_gemini_models.py
```

## API Changes

### Before
```json
{
  "query": ["battery", "camera"],
  "w1": 0.5,
  "w2": 0.5
}
```

### After (supports both formats)
```json
{
  "query": "I want a phone with good battery and camera",
  "w1": 0.5,
  "w2": 0.5
}
```

## Example Queries

- "I want a phone with long battery life and good screen"
- "Looking for excellent camera quality with zoom"
- "Need fast performance and good gaming"
- "Phone with titanium design and premium build"

## Files Modified

1. **recommendation_api.py** - Added Gemini integration and feature extraction
2. **recommendation-demo.html** - Updated UI for natural language queries
3. **requirements.txt** - Added `google-generativeai` package

## Valid Features

The system validates against 95 features extracted from `mobile_features.txt`, including:
- battery, battery life
- camera, camera system, zoom
- performance, fast
- titanium design
- screen, display
- And many more...

## Error Handling

- If Gemini API fails, falls back to simple keyword matching
- If no valid features found, returns helpful error message
- All errors are logged for debugging
