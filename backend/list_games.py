import httpx

r = httpx.get('http://127.0.0.1:8000/api/v1/games')
data = r.json()
games = data.get('data', [])
print(f"Total games: {len(games)}")
for g in games:
    print(f"- id: {g.get('id')} | slug: {g.get('slug')} | name: {g.get('name_en')} | category: {g.get('category')}")
