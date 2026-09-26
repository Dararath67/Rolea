from backend.app.data_store import DataStore

ds = DataStore()
games = ds.get_connected_api_games()
print(f"Total connected games: {len(games)}")
for g in games:
    print(f"{g['name_en']} ({g['id']}) -> Provider: {g['provider_name']} | Provider ID: {g['provider_id']} | Ext ID: {g['external_game_id']} | SKUs: {g['active_products_count']}/{g['products_count']}")
