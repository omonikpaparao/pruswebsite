import requests
import json

print("\n" + "="*60)
print("TESTING RECOMMENDATION API")
print("="*60)

url = 'http://localhost:5001/api/recommend'
payload = {
    'query': ['camera', 'quality'],
    'w1': 0.6,
    'w2': 0.4
}

print(f"\nSending request to: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print("\nWaiting for response...")

try:
    response = requests.post(url, json=payload, timeout=30)
    
    print(f"\nStatus Code: {response.status_code}")
    
    data = response.json()
    
    if data.get('success'):
        print(f"✓ Success!")
        print(f"Query: {data.get('query')}")
        print(f"Total Products Found: {data.get('totalProducts')}")
        
        if data.get('recommendations'):
            print(f"\n{'='*60}")
            print("TOP RECOMMENDATIONS:")
            print(f"{'='*60}")
            
            for i, product in enumerate(data['recommendations'][:5], 1):
                print(f"\n{i}. {product['productName']}")
                print(f"   Score: {product['score']}")
                print(f"   Price: ${product['price']}")
                print(f"   Category: {product.get('category', 'N/A')}")
        else:
            print("\n⚠️  No recommendations found!")
    else:
        print(f"✗ Failed: {data.get('message')}")
        
except requests.exceptions.Timeout:
    print("✗ Request timed out")
except requests.exceptions.ConnectionError:
    print("✗ Cannot connect to API. Is it running?")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "="*60)
