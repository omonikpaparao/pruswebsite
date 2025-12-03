# ✅ Verification Checklist

Use this checklist to verify the Gemini integration is working correctly.

## Pre-Flight Checks

- [ ] Python 3.x is installed
- [ ] All dependencies installed: `pip install -r requirements.txt`
- [ ] `mobile_features.txt` exists in project root
- [ ] MongoDB connection string is valid in `recommendation_api.py`
- [ ] Gemini API key is configured: `AIzaSyBc0Hx7j95RkGJkCJlj3JTW1UE0qUp2tqw`

## Test 1: Feature Loading

Run this command:
```bash
python test_gemini_features.py
```

Expected output:
```
✓ Loaded 95 valid features
Testing Gemini Feature Extraction
...
✓ Extracted features: [...]
```

- [ ] Features loaded successfully (95 features)
- [ ] Gemini API responds without errors
- [ ] Features are extracted from test queries

## Test 2: API Health

Start the API:
```bash
python recommendation_api.py
```

Expected output:
```
Starting PRUS Recommendation API...
Loaded 95 valid features
* Running on http://0.0.0.0:5001
```

- [ ] API starts without errors
- [ ] Features loaded message appears
- [ ] Server running on port 5001

In another terminal, test health:
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Recommendation API is running",
  "database": "Connected"
}
```

- [ ] Health endpoint returns success
- [ ] Database connection confirmed

## Test 3: Feature Extraction Endpoint

Test with natural language query:
```bash
curl -X POST http://localhost:5001/api/recommend \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"I want a phone with good battery and camera\", \"w1\": 0.5, \"w2\": 0.5}"
```

Expected response:
```json
{
  "success": true,
  "query": ["battery", "camera"],
  "recommendations": [...],
  "totalProducts": 10
}
```

- [ ] API accepts natural language query
- [ ] Features extracted correctly
- [ ] Recommendations returned
- [ ] Products have scores

## Test 4: Frontend Demo

Open `recommendation-demo.html` in browser.

- [ ] Page loads without errors
- [ ] Input field shows updated placeholder
- [ ] Example queries are conversational
- [ ] Weight sliders work

Type: "I want a phone with good battery and camera"

- [ ] Loading message appears
- [ ] Results display after processing
- [ ] Extracted features shown
- [ ] Product cards render correctly
- [ ] Scores are displayed

## Test 5: Different Queries

Try these queries in the demo:

1. "I want a phone with long battery life and good screen"
   - [ ] Returns results
   - [ ] Features include "battery" or "battery life"

2. "Looking for excellent camera quality with zoom"
   - [ ] Returns results
   - [ ] Features include "camera" and "zoom"

3. "Need fast performance"
   - [ ] Returns results
   - [ ] Features include "performance"

4. "Phone with titanium design"
   - [ ] Returns results
   - [ ] Features include "titanium design"

## Test 6: Error Handling

Test with invalid query:
```
"asdfghjkl random nonsense"
```

- [ ] Returns error message
- [ ] Message is helpful (mentions valid features)
- [ ] No crash or 500 error

## Test 7: Weight Adjustment

Try same query with different weights:

Query: "battery and camera"
- w1=0.9, w2=0.1 (favor positive reviews)
- [ ] Results change
- [ ] Scores are different

- w1=0.1, w2=0.9 (favor negative reviews)
- [ ] Results change
- [ ] Scores are different

## Test 8: Complete System Test

Run the complete test:
```bash
python test_complete_system.py
```

Expected output:
```
✓ API is healthy
Testing Natural Language Queries
✓ Success! Found X products
...
🎉 All tests passed! System is working perfectly.
```

- [ ] All tests pass
- [ ] No errors or warnings

## Files to Review

- [ ] `recommendation_api.py` - Backend with Gemini integration
- [ ] `recommendation-demo.html` - Frontend with natural language UI
- [ ] `requirements.txt` - Includes google-generativeai
- [ ] `mobile_features.txt` - Contains valid features
- [ ] `GEMINI_INTEGRATION.md` - Documentation
- [ ] `QUICKSTART_GEMINI.md` - Quick start guide

## Common Issues

### Issue: "Gemini API Error 404"
**Solution:** Model name might be wrong. Check available models with:
```python
import google.generativeai as genai
genai.configure(api_key="YOUR_KEY")
for m in genai.list_models():
    print(m.name)
```

### Issue: "No features loaded"
**Solution:** Make sure `mobile_features.txt` is in the project root directory.

### Issue: "Cannot connect to API"
**Solution:** 
1. Check if API is running: `python recommendation_api.py`
2. Check port 5001 is not in use
3. Update API_URL in `recommendation-demo.html` if needed

### Issue: "No recommendations returned"
**Solution:**
1. Check MongoDB connection
2. Verify products and comments exist in database
3. Run `/api/debug` endpoint to check data

## Success Criteria

✅ All checkboxes above are checked
✅ No errors in console
✅ Natural language queries work
✅ Results are relevant to query
✅ Scores make sense

## Final Verification

If you can:
1. ✅ Type "I want a phone with good battery and camera"
2. ✅ See "Extracting features with AI..." message
3. ✅ Get results showing phones with battery and camera features
4. ✅ See recommendation scores

**Then the integration is complete and working! 🎉**

---

## Need Help?

Check these files:
- `GEMINI_INTEGRATION.md` - Technical details
- `QUICKSTART_GEMINI.md` - Quick start guide
- `SYSTEM_FLOW.txt` - System architecture
- `INTEGRATION_SUMMARY.txt` - Overview

Or review the test scripts:
- `test_gemini_features.py` - Test feature extraction
- `test_complete_system.py` - Test entire system
