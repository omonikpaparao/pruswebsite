"""
Complete system test for Gemini-powered recommendation API
"""
import requests
import json

API_URL = "http://localhost:5001"

def test_health():
    """Test API health endpoint"""
    print("Testing API health...")
    try:
        response = requests.get(f"{API_URL}/api/health", timeout=5)
        data = response.json()
        if data.get('success'):
            print("✓ API is healthy")
            return True
        else:
            print("✗ API health check failed")
            return False
    except Exception as e:
        print(f"✗ Cannot connect to API: {e}")
        print("  Make sure to run: python recommendation_api.py")
        return False

def test_recommendation(query, w1=0.5, w2=0.5):
    """Test recommendation endpoint with natural language query"""
    print(f"\nTesting query: '{query}'")
    try:
        response = requests.post(
            f"{API_URL}/api/recommend",
            json={"query": query, "w1": w1, "w2": w2},
            timeout=30
        )
        data = response.json()
        
        if data.get('success'):
            print(f"✓ Success! Found {data.get('totalProducts', 0)} products")
            print(f"  Extracted features: {data.get('query', [])}")
            if data.get('recommendations'):
                print(f"  Top recommendation: {data['recommendations'][0]['productName']}")
                print(f"  Score: {data['recommendations'][0]['score']}")
            return True
        else:
            print(f"✗ Failed: {data.get('message', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    print("="*70)
    print("COMPLETE SYSTEM TEST - Gemini-Powered Recommendations")
    print("="*70)
    
    # Test health
    if not test_health():
        print("\n⚠️  API is not running. Start it with: python recommendation_api.py")
        exit(1)
    
    # Test queries
    test_queries = [
        "I want a phone with long battery life and good screen",
        "Looking for excellent camera quality with zoom",
        "Need fast performance",
        "Phone with titanium design"
    ]
    
    print("\n" + "="*70)
    print("Testing Natural Language Queries")
    print("="*70)
    
    success_count = 0
    for query in test_queries:
        if test_recommendation(query):
            success_count += 1
    
    print("\n" + "="*70)
    print(f"Results: {success_count}/{len(test_queries)} tests passed")
    print("="*70)
    
    if success_count == len(test_queries):
        print("\n🎉 All tests passed! System is working perfectly.")
    else:
        print(f"\n⚠️  {len(test_queries) - success_count} test(s) failed.")
