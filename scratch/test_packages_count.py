from backend.app.data_store import DataStore

ds = DataStore()
games = ds.get_connected_api_games()
print(f"Total connected games: {len(games)}")
for g in games:
    print(f"Game: {g['name_en']} -> {g['active_products_count']} / {g['products_count']} packages (Thumb: {g['thumbnail']})")
