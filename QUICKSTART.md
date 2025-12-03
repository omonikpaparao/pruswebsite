# Quick Start Guide - PRUS Recommendation System

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
python setup_nltk.py
```

### Step 2: Start the API

```bash
python recommendation_api.py
```

You should see:
```
Starting PRUS Recommendation API...
Endpoint: POST /api/recommend
Health Check: GET /api/health
 * Running on http://0.0.0.0:5001
```

### Step 3: Test It

Open a new terminal and run:

```bash
python test_api.py
```

Or open `recommendation-demo.html` in your browser to see the visual demo.

## 📝 Quick API Test

### Using cURL:

```bash
curl -X POST http://localhost:5001/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": ["battery", "screen"]}'
```

### Using Browser Console:

```javascript
fetch('http://localhost:5001/api/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: ['battery', 'camera'] })
})
.then(r => r.json())
.then(data => console.log(data));
```

## 🔧 Integration with Your Site

### Option 1: Add to Existing Pages

Add this to any HTML page:

```html
<script>
async function getRecommendations(features) {
  const response = await fetch('http://localhost:5001/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: features })
  });
  return await response.json();
}

// Usage
getRecommendations(['battery', 'screen']).then(data => {
  console.log('Recommended products:', data.recommendations);
});
</script>
```

### Option 2: Add Recommendation Section

Add this to `products.html` or create a new recommendations page:

```html
<section id="recommendations">
  <h2>Recommended for You</h2>
  <div id="recommendedProducts"></div>
</section>

<script>
async function loadRecommendations() {
  const features = ['quality', 'value']; // Customize based on user preferences
  
  const response = await fetch('http://localhost:5001/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: features, w1: 0.6, w2: 0.4 })
  });
  
  const data = await response.json();
  
  if (data.success) {
    const container = document.getElementById('recommendedProducts');
    container.innerHTML = data.recommendations.map(p => `
      <div class="product-card">
        <img src="${p.image}" alt="${p.productName}">
        <h3>${p.productName}</h3>
        <p>Match Score: ${p.score}</p>
        <p>$${p.price}</p>
        <a href="/product/${p.productId}">View Details</a>
      </div>
    `).join('');
  }
}

loadRecommendations();
</script>
```

## 🎯 Common Use Cases

### 1. Search-Based Recommendations

When user searches for "good battery phone":

```javascript
const searchQuery = "good battery phone";
const features = searchQuery.split(' ').filter(w => 
  !['good', 'bad', 'the', 'a', 'an'].includes(w)
);

getRecommendations(features);
```

### 2. Category-Based Recommendations

Show best products in a category:

```javascript
// For electronics category, focus on quality and performance
getRecommendations(['quality', 'performance', 'fast']);
```

### 3. User Preference-Based

Based on user's previous searches or views:

```javascript
const userPreferences = ['camera', 'battery', 'screen'];
getRecommendations(userPreferences);
```

## 🎨 Customizing Weights

### Balanced (Default)
```javascript
{ w1: 0.5, w2: 0.5 }  // Equal weight to positive and negative
```

### Optimistic
```javascript
{ w1: 0.7, w2: 0.3 }  // Favor products with positive reviews
```

### Cautious
```javascript
{ w1: 0.3, w2: 0.7 }  // Avoid products with negative reviews
```

## 🐛 Troubleshooting

### API Not Starting?

1. Check if port 5001 is available:
   ```bash
   netstat -ano | findstr :5001
   ```

2. Try a different port in `recommendation_api.py`:
   ```python
   app.run(debug=True, port=5002, host='0.0.0.0')
   ```

### No Recommendations Returned?

1. Check if comments exist in database:
   - Open MongoDB Atlas
   - Check `ecommerce.comments` collection
   - Ensure comments have `productId` and `comment` fields

2. Check API logs for errors

### CORS Issues?

If calling from a different domain, the API already has CORS enabled. If issues persist, check browser console for specific errors.

## 📊 Understanding Scores

- **Score > 0.5**: Strong positive sentiment for queried features
- **Score = 0.5**: Neutral or balanced sentiment
- **Score < 0.5**: More negative mentions than positive
- **Score = 0**: No mentions of queried features

## 🔄 Running Both Servers

Terminal 1 (Node.js):
```bash
node server.js
```

Terminal 2 (Python Flask):
```bash
python recommendation_api.py
```

Now your e-commerce site runs on port 5000 and recommendations API on port 5001!

## 📚 Next Steps

1. Read `RECOMMENDATION_API_README.md` for detailed documentation
2. Customize the algorithm weights for your use case
3. Add caching for better performance
4. Integrate into your existing product pages
5. Add user preference tracking

## 💡 Tips

- More comments = better recommendations
- Use specific feature keywords (e.g., "battery life" vs "battery")
- Adjust weights based on your business needs
- Monitor API performance with production data
