# 🚀 Quick Start Guide - Gemini-Powered Recommendations

## What's New?

Your recommendation system now uses **Google Gemini AI** to understand natural language queries! Users can type what they want in plain English instead of guessing feature names.

## Before vs After

### Before ❌
User had to type: `battery, camera, screen`

### After ✅
User can type: `I want a phone with good battery, camera, and screen`

## Setup (3 Steps)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Start the API
```bash
python recommendation_api.py
```

You should see:
```
Starting PRUS Recommendation API...
Loaded 95 valid features
* Running on http://0.0.0.0:5001
```

### Step 3: Open the Demo
Open `recommendation-demo.html` in your web browser.

## Try It Out!

Type any of these queries:

1. **"I want a phone with long battery life and good screen"**
   - Gemini extracts: battery, screen
   
2. **"Looking for excellent camera quality with zoom"**
   - Gemini extracts: camera, zoom
   
3. **"Need fast performance for gaming"**
   - Gemini extracts: performance
   
4. **"Phone with titanium design and premium build"**
   - Gemini extracts: titanium design

## How It Works

```
User Query → Gemini AI → Feature Extraction → Validation → PRUS Algorithm → Results
```

1. User types natural language query
2. Gemini AI extracts relevant features
3. Features are validated against `mobile_features.txt`
4. PRUS algorithm ranks products
5. Results displayed with scores

## Testing

### Test Feature Extraction
```bash
python test_gemini_features.py
```

### Test Complete System
```bash
python test_complete_system.py
```

## Configuration

### Gemini API Key
Located in `recommendation_api.py`:
```python
GEMINI_API_KEY = "AIzaSyBc0Hx7j95RkGJkCJlj3JTW1UE0qUp2tqw"
```

### Valid Features
Loaded from `mobile_features.txt` (95 features)

### Weights
- **w1** (Positive sentiment weight): 0.0 to 1.0
- **w2** (Negative sentiment weight): 0.0 to 1.0

## Troubleshooting

### API Not Starting?
```bash
# Check if port 5001 is available
netstat -ano | findstr :5001

# Try a different port in recommendation_api.py
app.run(debug=True, port=5002, host='0.0.0.0')
```

### Gemini API Error?
- Check internet connection
- Verify API key is valid
- System falls back to keyword matching automatically

### No Results?
- Make sure MongoDB is connected
- Check if products and comments exist in database
- Try simpler queries like "battery" or "camera"

## API Endpoints

### Health Check
```bash
GET http://localhost:5001/api/health
```

### Get Recommendations
```bash
POST http://localhost:5001/api/recommend
Content-Type: application/json

{
  "query": "I want a phone with good battery",
  "w1": 0.5,
  "w2": 0.5
}
```

### Debug Database
```bash
GET http://localhost:5001/api/debug
```

## Need Help?

Check these files:
- `GEMINI_INTEGRATION.md` - Detailed technical documentation
- `INTEGRATION_SUMMARY.txt` - Quick overview
- `RECOMMENDATION_API_README.md` - Original API documentation

## Success! 🎉

If you can:
1. ✅ Start the API without errors
2. ✅ Open the demo page
3. ✅ Type a query and get results

Then everything is working perfectly!
