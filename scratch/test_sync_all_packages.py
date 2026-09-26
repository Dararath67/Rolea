from backend.app.data_store import DataStore
from backend.app.services.sync_service import SyncService

ds = DataStore()
SyncService.sync_all(ds)

connected = ds.get_connected_api_games()
print(f"Total connected games after sync_all: {len(connected)}")
zero_pkg_games = [g for g in connected if g['products_count'] == 0]
print(f"Games with 0 packages: {len(zero_pkg_games)}")

for g in connected[:10]:
    print(f"  {g['name_en']} ({g['id']}) -> {g['active_products_count']} / {g['products_count']} packages")
