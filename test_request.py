import requests
import json
import time

# Wait a moment for API to be ready
time.sleep(2)

print("Testing recommendation API...")
print("=" * 60)

# Test 1: Health check
print("\n1. Health Check:")
try:
    response = requests.get('http://localhost:5001/api/health', timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Debug endpoint
print("\n2. Debug Data:")
try:
    response = requests.get('http://localhost:5001/api/debug', timeout=10)
    data = response.json()
    print(f"Status: {response.status_code}")
    print(f"Total Comments: {data.get('totalComments')}")
    print(f"Total Products: {data.get('totalProducts')}")
    if data.get('sampleComments'):
        print(f"Sample comment: {data['sampleComments'][0].get('comment', '')[:50]}...")
except Exception as e:
    print(f"Error: {e}")

# Test 3: Recommendation request
print("\n3. Recommendation Request:")
print("Query: ['battery', 'screen']")
try:
    response = requests.post(
        'http://localhost:5001/api/recommend',
        json={
            'query': ['battery', 'screen'],
            'w1': 0.5,
            'w2': 0.5
        },
        headers={'Content-Type': 'application/json'},
        timeout=30
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Success: {data.get('success')}")
    
    if data.get('success'):
        print(f"Total Products: {data.get('totalProducts')}")
        if data.get('recommendations'):
            print("\nTop 3 Recommendations:")
            for i, prod in enumerate(data['recommendations'][:3], 1):
                print(f"  {i}. {prod['productName']} - Score: {prod['score']}")
        else:
            print("No recommendations returned")
    else:
        print(f"Error: {data.get('message')}")
        
    print(f"\nFull response:")
    print(json.dumps(data, indent=2))
    
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 60)
