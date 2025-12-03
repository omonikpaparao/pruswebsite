"""
Test script to verify Gemini API feature extraction
"""
import google.generativeai as genai
import re

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyBc0Hx7j95RkGJkCJlj3JTW1UE0qUp2tqw"
genai.configure(api_key=GEMINI_API_KEY)

# Load valid features
def load_valid_features():
    valid_features = set()
    try:
        with open('mobile_features.txt', 'r', encoding='utf-8') as f:
            for line in f:
                match = re.search(r'\[(.*?)\]', line)
                if match:
                    features_str = match.group(1)
                    features = re.findall(r"'([^']+)'", features_str)
                    valid_features.update([f.lower().strip() for f in features])
        print(f"✓ Loaded {len(valid_features)} valid features")
        return valid_features
    except Exception as e:
        print(f"✗ Error loading features: {e}")
        return set()

VALID_FEATURES = load_valid_features()

def extract_features_with_gemini(user_query):
    """Extract valid features from user query using Gemini"""
    try:
        features_list = ', '.join(sorted(VALID_FEATURES)[:100])
        
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
        print(f"  Gemini response: {extracted_text}")
        
        if extracted_text == "none":
            return []
        
        extracted_features = [f.strip() for f in extracted_text.split(',')]
        
        # Validate against VALID_FEATURES
        validated_features = []
        for feature in extracted_features:
            if feature in VALID_FEATURES:
                validated_features.append(feature)
            else:
                for valid_feature in VALID_FEATURES:
                    if feature in valid_feature or valid_feature in feature:
                        validated_features.append(valid_feature)
                        break
        
        validated_features = list(set(validated_features))
        return validated_features
        
    except Exception as e:
        print(f"✗ Error with Gemini API: {e}")
        return []

# Test queries
test_queries = [
    "I want a phone with long battery life and good screen",
    "Looking for excellent camera quality with zoom",
    "Need fast performance and good gaming",
    "Phone with titanium design and premium build"
]

print("\n" + "="*60)
print("Testing Gemini Feature Extraction")
print("="*60 + "\n")

for query in test_queries:
    print(f"Query: '{query}'")
    features = extract_features_with_gemini(query)
    print(f"✓ Extracted features: {features}")
    print()

print("="*60)
print("Test complete!")
