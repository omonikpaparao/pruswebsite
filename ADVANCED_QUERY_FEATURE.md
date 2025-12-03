# 🤖 Advanced Query Feature - User Guide

## Overview

A new **AI-Powered Search** button has been added to the Products page that allows logged-in users to access the advanced Gemini-powered recommendation system.

## What's New?

### Products Page Enhancement

- **New Button**: "🤖 AI-Powered Search" button in the search bar
- **Visibility**: Only visible to logged-in users
- **Location**: Next to the Search and Clear buttons
- **Style**: Eye-catching gradient design matching the recommendation demo

## How It Works

### For Logged-In Users

1. **Login** to your account
2. Navigate to the **Products** page
3. You'll see the **"🤖 AI-Powered Search"** button in the search bar
4. Click the button to access the advanced recommendation system
5. Use natural language to describe what you're looking for

### For Non-Logged-In Users

- The button is **hidden** until you log in
- Regular search functionality still available
- Login required to access AI-powered features

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens Products Page                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Logged In?    │
                    └───────────────┘
                      │           │
                 Yes  │           │  No
                      ▼           ▼
        ┌──────────────────┐   ┌──────────────────┐
        │ Show AI Button   │   │ Hide AI Button   │
        └──────────────────┘   └──────────────────┘
                │
                ▼
        ┌──────────────────┐
        │ User Clicks      │
        │ AI Button        │
        └──────────────────┘
                │
                ▼
        ┌──────────────────────────────────────┐
        │ Redirect to recommendation-demo.html │
        └──────────────────────────────────────┘
                │
                ▼
        ┌──────────────────────────────────────┐
        │ User enters natural language query   │
        │ "I want a phone with good battery"   │
        └──────────────────────────────────────┘
                │
                ▼
        ┌──────────────────────────────────────┐
        │ Gemini AI extracts features          │
        │ PRUS algorithm ranks products        │
        │ Results displayed                    │
        └──────────────────────────────────────┘
```

## Visual Design

### Button Appearance

- **Color**: Purple gradient (matches recommendation demo theme)
- **Icon**: 🤖 Robot emoji for AI indication
- **Text**: "AI-Powered Search"
- **Effect**: Hover animation with shadow lift
- **Position**: Right side of search bar

### Button States

1. **Hidden** (not logged in)
   - `display: none`
   
2. **Visible** (logged in)
   - `display: inline-block`
   - Gradient background
   - Shadow effect

3. **Hover**
   - Lifts up slightly
   - Shadow intensifies
   - Smooth transition

## Code Changes

### HTML Structure

```html
<div class="search-container">
  <input type="text" id="searchInput" placeholder="🔍 Search products..." class="search-input">
  <button id="searchBtn" class="search-btn">Search</button>
  <button id="clearSearchBtn" class="clear-search-btn">Clear</button>
  <button id="advancedQueryBtn" class="advanced-query-btn" style="display: none;">
    🤖 AI-Powered Search
  </button>
</div>
```

### CSS Styling

```css
.advanced-query-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.advanced-query-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}
```

### JavaScript Logic

```javascript
function updateNavigation() {
  const userEmail = localStorage.getItem('userEmail');
  const advancedQueryBtn = document.getElementById('advancedQueryBtn');
  
  if (userEmail) {
    // Show button for logged-in users
    if (advancedQueryBtn) {
      advancedQueryBtn.style.display = 'inline-block';
    }
  } else {
    // Hide button for non-logged-in users
    if (advancedQueryBtn) {
      advancedQueryBtn.style.display = 'none';
    }
  }
}

// Button click handler
advancedQueryBtn.addEventListener('click', function() {
  window.location.href = '/recommendation-demo.html';
});
```

## Benefits

### For Users

✅ **Easy Access** - One click from Products page to AI search
✅ **Natural Language** - Describe what you want in plain English
✅ **Better Results** - AI-powered feature extraction and ranking
✅ **Personalized** - Only available to registered users

### For Business

✅ **User Engagement** - Encourages login/registration
✅ **Better UX** - Advanced search for power users
✅ **Differentiation** - Unique AI-powered feature
✅ **Data Collection** - Track user preferences and queries

## Testing Checklist

- [ ] Button hidden when not logged in
- [ ] Button visible after login
- [ ] Button has correct styling (gradient, shadow)
- [ ] Hover effect works smoothly
- [ ] Click redirects to recommendation-demo.html
- [ ] Recommendation demo works correctly
- [ ] Button disappears after logout

## Example User Journey

### Scenario: User Looking for a Phone

1. **User logs in** to DeLux Mart
2. **Navigates to Products** page
3. **Sees regular search** and **AI-Powered Search** button
4. **Tries regular search** first: "phone"
   - Gets all phones listed
5. **Wants better results**, clicks **"🤖 AI-Powered Search"**
6. **Redirected** to recommendation demo
7. **Types natural query**: "I want a phone with long battery life and excellent camera"
8. **Gemini AI** extracts: ["battery life", "camera"]
9. **PRUS algorithm** ranks phones based on reviews
10. **Gets personalized results** with scores
11. **Finds perfect phone** matching their needs

## Comparison: Regular vs AI Search

### Regular Search
- **Input**: "phone battery"
- **Method**: Keyword matching
- **Results**: All phones with "battery" in name/description
- **Ranking**: No intelligent ranking

### AI-Powered Search
- **Input**: "I want a phone with long battery life"
- **Method**: Gemini AI feature extraction + PRUS algorithm
- **Results**: Phones ranked by battery sentiment in reviews
- **Ranking**: Intelligent scoring based on positive/negative reviews

## Future Enhancements

Potential improvements:

1. **Inline AI Search** - Add AI search directly to Products page
2. **Query Suggestions** - Show popular AI queries
3. **Save Searches** - Let users save their AI queries
4. **Compare Results** - Side-by-side regular vs AI results
5. **User Feedback** - Rate AI recommendations
6. **History** - Show previous AI searches

## Troubleshooting

### Button Not Showing After Login

**Check:**
1. Is `userEmail` stored in localStorage?
2. Is `updateNavigation()` called after login?
3. Browser console for JavaScript errors?

**Solution:**
```javascript
// Verify in browser console
console.log(localStorage.getItem('userEmail'));
```

### Button Shows But Doesn't Redirect

**Check:**
1. Is event listener attached?
2. Is path `/recommendation-demo.html` correct?
3. Does file exist in root directory?

**Solution:**
```javascript
// Test redirect manually
window.location.href = '/recommendation-demo.html';
```

### Styling Issues

**Check:**
1. CSS loaded correctly?
2. Browser cache cleared?
3. Conflicting styles?

**Solution:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check browser DevTools for CSS conflicts

## Files Modified

- **products.html** - Added AI-Powered Search button with logic

## Related Documentation

- `GEMINI_INTEGRATION.md` - Gemini API integration details
- `QUICKSTART_GEMINI.md` - Quick start guide
- `SYSTEM_FLOW.txt` - System architecture
- `VERIFICATION_CHECKLIST.md` - Testing checklist

---

## Summary

The **AI-Powered Search** button provides logged-in users with seamless access to the advanced Gemini-powered recommendation system, enhancing the shopping experience with natural language queries and intelligent product ranking.

**Key Points:**
- ✅ Only visible to logged-in users
- ✅ One-click access to AI recommendations
- ✅ Beautiful gradient design
- ✅ Smooth user experience
- ✅ Encourages user registration
