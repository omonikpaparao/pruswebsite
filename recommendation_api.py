from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from textblob import TextBlob
import pandas as pd
from collections import defaultdict
import google.generativeai as genai
import os
import re

app = Flask(__name__)
CORS(app)

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyBc0Hx7j95RkGJkCJlj3JTW1UE0qUp2tqw"
genai.configure(api_key=GEMINI_API_KEY)

# MongoDB connection
MONGO_URI = "mongodb+srv://v647414:223344vinay@cluster0.lus5rot.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client['ecommerce']

# Load valid features from mobile_features.txt
def load_valid_features():
    """Load all valid features from mobile_features.txt"""
    valid_features = set()
    try:
        with open('mobile_features.txt', 'r', encoding='utf-8') as f:
            for line in f:
                # Extract features from lines like: "['feature1', 'feature2', ...]"
                match = re.search(r'\[(.*?)\]', line)
                if match:
                    features_str = match.group(1)
                    # Parse individual features
                    features = re.findall(r"'([^']+)'", features_str)
                    valid_features.update([f.lower().strip() for f in features])
        print(f"Loaded {len(valid_features)} valid features")
        return valid_features
    except Exception as e:
        print(f"Error loading features: {e}")
        return set()

VALID_FEATURES = load_valid_features()

def extract_features_with_gemini(user_query):
    """
    Use Gemini API to extract valid features from user query.
    Only returns features that exist in mobile_features.txt
    """
    try:
        # Create prompt for Gemini
        features_list = ', '.join(sorted(VALID_FEATURES)[:100])  # Show sample of features
        
        prompt = f"""You are a feature extraction assistant for a mobile phone recommendation system.

Valid features from our database include: {features_list}... and more.

User query: "{user_query}"

Task: Extract ONLY the features from the user query that match or are closely related to features in our database. Return them as a comma-separated list.

Rules:
1. Only return features that exist in the valid features list
2. Match synonyms (e.g., "battery life" matches "battery")
3. Return lowercase features
4. If no valid features found, return "NONE"

Example:
User query: "I want a phone with good battery and camera"
Output: battery, camera

Now extract features from the user query above:"""

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        extracted_text = response.text.strip().lower()
        print(f"Gemini response: {extracted_text}")
        
        if extracted_text == "none":
            return []
        
        # Parse extracted features
        extracted_features = [f.strip() for f in extracted_text.split(',')]
        
        # Validate against VALID_FEATURES
        validated_features = []
        for feature in extracted_features:
            # Direct match
            if feature in VALID_FEATURES:
                validated_features.append(feature)
            else:
                # Partial match - check if feature is substring of any valid feature
                for valid_feature in VALID_FEATURES:
                    if feature in valid_feature or valid_feature in feature:
                        validated_features.append(valid_feature)
                        break
        
        # Remove duplicates
        validated_features = list(set(validated_features))
        print(f"Validated features: {validated_features}")
        
        return validated_features
        
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        # Fallback: simple keyword matching
        return fallback_feature_extraction(user_query)

def fallback_feature_extraction(user_query):
    """Fallback feature extraction using simple keyword matching"""
    query_lower = user_query.lower()
    matched_features = []
    
    for feature in VALID_FEATURES:
        if feature in query_lower:
            matched_features.append(feature)
    
    return matched_features

class PRUSRecommender:
    def __init__(self, data):
        """
        Initialize with a DataFrame containing 'Product' and 'Review' columns.
        """
        print("Hello")
        self.data = data
        self.product_features = {}  # {product: {feature: {'pos': 0, 'neg': 0}}}
        
    def process_reviews(self):
        """
        Phase 1 & 2: Split reviews into sentences, extract features and sentiments.
        """
        print("Processing reviews...")
        
        for index, row in self.data.iterrows():
            product = row['Product']
            review_text = str(row['Review'])
            
            if product not in self.product_features:
                self.product_features[product] = {}
            
            # Break down into sentences
            blob = TextBlob(review_text)
            for sentence in blob.sentences:
                # Sentiment Analysis & Feature Extraction
                sentiment = sentence.sentiment.polarity
                features = sentence.noun_phrases
                print(features)
                
                # Determine polarity category
                if sentiment > 0.05:
                    polarity = 'pos'
                elif sentiment < -0.05:
                    polarity = 'neg'
                else:
                    continue  # Skip neutral
                
                # Extract features with sentiments
                for feature in features:
                    feature = feature.lower()
                    if feature not in self.product_features[product]:
                        self.product_features[product][feature] = {'pos': 0, 'neg': 0}
                    
                    self.product_features[product][feature][polarity] += 1

    def rank_ify(self, query_features, w1=0.5, w2=0.5):
        """
        Phase 3: RANK-ify Algorithm.
        Ranks products based on user specifications and sentiment weights.
        """
        ranked_products = []
        
        # Normalize weights
        if w1 + w2 != 1:
            total_w = w1 + w2
            w1 = w1 / total_w
            w2 = w2 / total_w
            
        print(f"Ranking for features: {query_features} (w1={w1}, w2={w2})")
        
        for product, features_data in self.product_features.items():
            rank_score = 0
            found_any = False
            
            for user_feature in query_features:
                user_feature = user_feature.lower()
                
                # Check if product has this feature
                matched_db_features = [f for f in features_data.keys() if user_feature in f]
                
                for db_f in matched_db_features:
                    stats = features_data[db_f]
                    c_pos = stats['pos']
                    c_neg = stats['neg']
                    total_count = c_pos + c_neg
                    
                    if total_count > 0:
                        # FeaSco = (w1 * c(f+) - w2 * c(f-)) / (c(f+) + c(f-))
                        fea_sco = (w1 * c_pos - w2 * c_neg) / total_count
                        rank_score += fea_sco
                        found_any = True
            
            if found_any:
                ranked_products.append((product, rank_score))
        
        # Sort by Rank Score descending
        ranked_products.sort(key=lambda x: x[1], reverse=True)
        return ranked_products


@app.route('/api/recommend', methods=['POST'])
def recommend_products():
    """
    API endpoint to get product recommendations based on user query.
    
    Request body:
    {
        "query": "I want a phone with good battery and camera",  // natural language query
        "w1": 0.5,  // optional, weight for positive sentiment
        "w2": 0.5   // optional, weight for negative sentiment
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'message': 'Query is required'
            }), 400
        
        user_query = data['query']
        w1 = data.get('w1', 0.5)
        w2 = data.get('w2', 0.5)
        
        # Extract features using Gemini API
        if isinstance(user_query, str):
            print(f"Processing natural language query: {user_query}")
            query_features = extract_features_with_gemini(user_query)
        elif isinstance(user_query, list):
            # Legacy support for direct feature lists
            query_features = user_query
        else:
            return jsonify({
                'success': False,
                'message': 'Query must be a string or list'
            }), 400
        
        if not query_features or len(query_features) == 0:
            return jsonify({
                'success': False,
                'message': 'No valid features found in your query. Please try describing phone features like battery, camera, screen, etc.'
            }), 400
        
        print(f"Extracted features: {query_features}")
        
        # Fetch comments from MongoDB
        comments_collection = db['comments']
        products_collection = db['products']
        
        comments = list(comments_collection.find({}))
        
        print(f"Found {len(comments)} comments in database")
        
        if not comments:
            return jsonify({
                'success': False,
                'message': 'No comments found in database'
            }), 404
        
        # Prepare data for PRUS
        review_data = []
        product_id_to_name = {}
        
        # Get product names - convert string IDs to ObjectId
        for comment in comments:
            product_id_str = comment.get('productId')
            print(f"Processing comment for productId: {product_id_str} (type: {type(product_id_str)})")
            
            if product_id_str and product_id_str not in product_id_to_name:
                # Convert string ID to ObjectId for lookup
                try:
                    product_id_obj = ObjectId(product_id_str)
                    product = products_collection.find_one({'_id': product_id_obj})
                    
                    if product:
                        product_id_to_name[product_id_str] = product.get('name', product_id_str)
                        print(f"Found product: {product.get('name')}")
                    else:
                        print(f"Product not found for ID: {product_id_str}")
                except Exception as e:
                    print(f"Error converting ID {product_id_str}: {e}")
        
        # Build review dataset
        for comment in comments:
            product_id = comment.get('productId')
            comment_text = comment.get('comment', '')
            
            if product_id and comment_text:
                product_name = product_id_to_name.get(product_id, product_id)
                review_data.append({
                    'Product': product_name,
                    'ProductId': product_id,
                    'Review': comment_text
                })
        
        print(f"Built {len(review_data)} review entries")
        
        if not review_data:
            return jsonify({
                'success': False,
                'message': 'No valid reviews found'
            }), 404
        
        # Create DataFrame
        df = pd.DataFrame(review_data)
        
        # Initialize and run PRUS
        prus = PRUSRecommender(df)
        prus.process_reviews()
        
        print(f"Processed features for {len(prus.product_features)} products")
        for prod, features in prus.product_features.items():
            print(f"  {prod}: {len(features)} features - {list(features.keys())[:5]}")
        
        ranked_products = prus.rank_ify(query_features, w1, w2)
        
        print(f"Ranked {len(ranked_products)} products")
        
        # Format results
        recommendations = []
        for product_name, score in ranked_products:
            print(f"Processing ranked product: {product_name} (score: {score})")
            
            # Find product ID
            product_id = None
            for item in review_data:
                if item['Product'] == product_name:
                    product_id = item['ProductId']
                    break
            
            # Get full product details
            if product_id:
                # Convert string ID to ObjectId for lookup
                try:
                    product_id_obj = ObjectId(product_id)
                    product = products_collection.find_one({'_id': product_id_obj})
                    
                    if product:
                        recommendations.append({
                            'productId': str(product['_id']),
                            'productName': product.get('name', product_name),
                            'score': round(score, 4),
                            'image': product.get('image', ''),
                            'price': product.get('price', 0),
                            'category': product.get('category', ''),
                            'description': product.get('description', '')
                        })
                    else:
                        print(f"Could not find product details for {product_id}")
                except Exception as e:
                    print(f"Error looking up product {product_id}: {e}")
        
        return jsonify({
            'success': True,
            'query': query_features,
            'recommendations': recommendations,
            'totalProducts': len(recommendations)
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error processing recommendation: {str(e)}'
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        return jsonify({
            'success': True,
            'message': 'Recommendation API is running',
            'database': 'Connected'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Database connection failed',
            'error': str(e)
        }), 500


@app.route('/api/debug', methods=['GET'])
def debug_data():
    """Debug endpoint to check database contents"""
    try:
        comments_collection = db['comments']
        products_collection = db['products']
        
        # Get sample data
        comments = list(comments_collection.find({}).limit(5))
        products = list(products_collection.find({}).limit(5))
        
        # Convert ObjectId to string for JSON serialization
        for comment in comments:
            if '_id' in comment:
                comment['_id'] = str(comment['_id'])
        
        for product in products:
            if '_id' in product:
                product['_id'] = str(product['_id'])
        
        return jsonify({
            'success': True,
            'totalComments': comments_collection.count_documents({}),
            'totalProducts': products_collection.count_documents({}),
            'sampleComments': comments,
            'sampleProducts': products
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("Starting PRUS Recommendation API...")
    print("Endpoint: POST /api/recommend")
    print("Health Check: GET /api/health")
    app.run(debug=True, port=5001, host='0.0.0.0')
