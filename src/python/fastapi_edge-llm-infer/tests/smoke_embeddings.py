import requests, json, sys

BASE = "http://localhost:8000"

def main():
    payload = {
        "input": ["Hello world", "機器學習 讓 電腦 從 數據 中 學習"],
    }
    r = requests.post(f"{BASE}/v1/embeddings", json=payload, timeout=120)
    print("Status:", r.status_code)
    try:
        data = r.json()
    except Exception:
        print(r.text)
        return
    print(json.dumps({
        'count': len(data.get('data', [])),
        'first_dim': len(data.get('data', [{}])[0].get('embedding', [])) if data.get('data') else 0,
        'usage': data.get('usage')
    }, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
