"""
Test script for PRUS Recommendation API
"""
import requests
import json

API_URL = "http://localhost:5001"

def test_health():
    """Test health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{API_URL}/api/health")
        data = response.json()
        print(f"✓ Health Check: {data}")
        return data.get('success', False)
    except Exception as e:
        print(f"✗ Health Check Failed: {e}")
        return False

def test_recommendations():
    """Test recommendation endpoint"""
    print("\nTesting recommendations...")
    
    test_queries = [
        {
            "query": ["battery", "screen"],
            "w1": 0.5,
            "w2": 0.5
        },
        {
            "query": ["camera"],
            "w1": 0.7,
            "w2": 0.3
        },
        {
            "query": ["quality", "price"],
            "w1": 0.6,
            "w2": 0.4
        }
    ]
    
    for i, test_query in enumerate(test_queries, 1):
        print(f"\n--- Test {i} ---")
        print(f"Query: {test_query['query']}")
        print(f"Weights: w1={test_query['w1']}, w2={test_query['w2']}")
        
        try:
            response = requests.post(
                f"{API_URL}/api/recommend",
                json=test_query,
                headers={"Content-Type": "application/json"}
            )
            
            data = response.json()
            
            if data.get('success'):
                print(f"✓ Success! Found {data.get('totalProducts', 0)} products")
                
                if data.get('recommendations'):
                    print("\nTop 3 Recommendations:")
                    for j, product in enumerate(data['recommendations'][:3], 1):
                        print(f"  {j}. {product['productName']}")
                        print(f"     Score: {product['score']}")
                        print(f"     Price: ${product.get('price', 'N/A')}")
                else:
                    print("No recommendations found")
            else:
                print(f"✗ Failed: {data.get('message', 'Unknown error')}")
                
        except Exception as e:
            print(f"✗ Request Failed: {e}")

def test_error_handling():
    """Test error handling"""
    print("\n\nTesting error handling...")
    
    # Test 1: Missing query
    print("\n--- Test: Missing query ---")
    try:
        response = requests.post(
            f"{API_URL}/api/recommend",
            json={},
            headers={"Content-Type": "application/json"}
        )
        data = response.json()
        print(f"Response: {data.get('message', 'No message')}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Invalid query format
    print("\n--- Test: Invalid query format ---")
    try:
        response = requests.post(
            f"{API_URL}/api/recommend",
            json={"query": "not a list"},
            headers={"Content-Type": "application/json"}
        )
        data = response.json()
        print(f"Response: {data.get('message', 'No message')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("PRUS Recommendation API Test Suite")
    print("=" * 50)
    
    # Test health check
    if test_health():
        # Test recommendations
        test_recommendations()
        
        # Test error handling
        test_error_handling()
    else:
        print("\n⚠️  API is not running. Please start the API first:")
        print("   python recommendation_api.py")
    
    print("\n" + "=" * 50)
    print("Test Suite Complete")
    print("=" * 50)
