import requests, json, sys

BASE = "http://localhost:8000"

payload = {
    "messages": [{"role": "user", "content": "Say hello in Chinese."}],
    "stream": False
}

r = requests.post(f"{BASE}/v1/chat/completions", json=payload, timeout=120)
print("Status:", r.status_code)
print(r.text)

print("Streaming test...")
stream_payload = {
    "messages": [{"role": "user", "content": "List three fruits."}],
    "stream": True
}
rs = requests.post(f"{BASE}/v1/chat/completions", json=stream_payload, stream=True)
for line in rs.iter_lines():
    if not line:
        continue
    if line.startswith(b"data: "):
        data = line[len(b"data: "):]
        if data == b"[DONE]":
            print("\n<END>")
            break
        obj = json.loads(data)
        delta = obj['choices'][0]['delta'].get('content')
        if delta:
            sys.stdout.write(delta)
            sys.stdout.flush()
