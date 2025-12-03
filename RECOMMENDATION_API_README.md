# PRUS Product Recommendation API

This Flask API implements the PRUS (Product Ranking Using Sentiments) algorithm to recommend products based on user comments from your MongoDB database.

## Features

- Fetches comments from MongoDB Atlas
- Analyzes sentiment using TextBlob
- Extracts product features from reviews
- Ranks products based on user query features
- Returns ranked product recommendations with scores

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Download NLTK Data

```bash
python setup_nltk.py
```

## Running the API

Start the Flask server:

```bash
python recommendation_api.py
```

The API will run on `http://localhost:5001`

## API Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the API and database connection are working.

**Response:**
```json
{
  "success": true,
  "message": "Recommendation API is running",
  "database": "Connected"
}
```

### 2. Get Recommendations

**POST** `/api/recommend`

Get product recommendations based on user query features.

**Request Body:**
```json
{
  "query": ["battery", "screen", "camera"],
  "w1": 0.5,
  "w2": 0.5
}
```

**Parameters:**
- `query` (required): Array of feature keywords to search for
- `w1` (optional, default: 0.5): Weight for positive sentiment (0-1)
- `w2` (optional, default: 0.5): Weight for negative sentiment (0-1)

**Response:**
```json
{
  "success": true,
  "query": ["battery", "screen"],
  "recommendations": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Samsung Galaxy S23",
      "score": 0.8750,
      "image": "https://example.com/image.jpg",
      "price": 799.99,
      "category": "Electronics",
      "description": "Latest smartphone..."
    }
  ],
  "totalProducts": 5
}
```

## Usage Examples

### Using cURL

```bash
# Health check
curl http://localhost:5001/api/health

# Get recommendations
curl -X POST http://localhost:5001/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": ["battery", "screen"]}'
```

### Using JavaScript (Fetch API)

```javascript
// Get recommendations
fetch('http://localhost:5001/api/recommend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: ['battery', 'screen', 'camera'],
    w1: 0.6,  // More weight on positive reviews
    w2: 0.4   // Less weight on negative reviews
  })
})
.then(response => response.json())
.then(data => {
  console.log('Recommendations:', data.recommendations);
})
.catch(error => console.error('Error:', error));
```

### Using Python Requests

```python
import requests

# Get recommendations
response = requests.post('http://localhost:5001/api/recommend', json={
    'query': ['battery', 'screen'],
    'w1': 0.5,
    'w2': 0.5
})

data = response.json()
if data['success']:
    for product in data['recommendations']:
        print(f"{product['productName']}: {product['score']}")
```

## How It Works

### PRUS Algorithm

1. **Data Collection**: Fetches all comments from MongoDB `comments` collection
2. **Sentence Splitting**: Breaks reviews into individual sentences
3. **Feature Extraction**: Extracts noun phrases as product features
4. **Sentiment Analysis**: Analyzes sentiment polarity for each sentence
5. **Feature Scoring**: Calculates feature scores using the formula:
   ```
   FeaSco(f) = (w1 × c(f+) - w2 × c(f-)) / (c(f+) + c(f-))
   ```
   Where:
   - `c(f+)` = count of positive mentions
   - `c(f-)` = count of negative mentions
   - `w1` = weight for positive sentiment
   - `w2` = weight for negative sentiment

6. **Product Ranking**: Ranks products by total feature scores

### Weight Configuration

- **w1 = 0.5, w2 = 0.5**: Balanced (default)
- **w1 = 0.7, w2 = 0.3**: Favor products with positive reviews
- **w1 = 0.3, w2 = 0.7**: Avoid products with negative reviews

## Integration with Your E-commerce Site

Add a recommendation section to your product pages:

```javascript
// In your HTML/JavaScript
async function loadRecommendations(features) {
  try {
    const response = await fetch('http://localhost:5001/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: features })
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayRecommendations(data.recommendations);
    }
  } catch (error) {
    console.error('Error loading recommendations:', error);
  }
}

function displayRecommendations(products) {
  const container = document.getElementById('recommendations');
  container.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.image}" alt="${p.productName}">
      <h3>${p.productName}</h3>
      <p>Score: ${p.score}</p>
      <p>Price: $${p.price}</p>
    </div>
  `).join('');
}

// Example: Get recommendations for battery and camera
loadRecommendations(['battery', 'camera']);
```

## Troubleshooting

### Port Already in Use

If port 5001 is already in use, change it in `recommendation_api.py`:

```python
app.run(debug=True, port=5002, host='0.0.0.0')
```

### MongoDB Connection Issues

Verify your MongoDB URI in `recommendation_api.py`:

```python
MONGO_URI = "mongodb+srv://v647414:223344vinay@cluster0.lus5rot.mongodb.net/"
```

### NLTK Data Not Found

Run the setup script again:

```bash
python setup_nltk.py
```

## Notes

- The API runs on port 5001 (your Node.js server runs on 5000)
- CORS is enabled for all origins
- The API processes all comments in the database for each request
- For production, consider caching processed reviews

## Production Deployment

For production deployment:

1. Set `debug=False` in `recommendation_api.py`
2. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5001 recommendation_api:app
   ```
3. Consider implementing caching for better performance
4. Add authentication if needed
