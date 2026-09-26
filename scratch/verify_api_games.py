import httpx

try:
    r = httpx.get("http://127.0.0.1:8000/api/v1/games", timeout=10.0)
    print("STATUS:", r.status_code)
    res = r.json()
    for g in res.get("data", []):
        print(f"[{g.get('id')}] {g.get('name_en')} -> {g.get('thumbnail')}")
except Exception as e:
    print("Error:", e)
