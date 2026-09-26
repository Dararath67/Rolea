import json
import os

# 1. Update backend/app/data_store.py
ds_path = "backend/app/data_store.py"
with open(ds_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove FazerCards seed from _seed_games
content = content.replace("fzr_games = self._seed_fazercards_games(pricing_cfg)\n                games_list.extend(fzr_games)", "# FazerCards seed disabled\n                pass")

with open(ds_path, "w", encoding="utf-8") as f:
    f.write(content)
print("data_store.py updated: FazerCards seed disabled.")

# 2. Update backend/app/data_store.json
json_path = "backend/app/data_store.json"
if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        ds_json = json.load(f)
    
    ds_json["active_primary_provider_id"] = "bay2game"
    
    if "providers" in ds_json:
        ds_json["providers"] = [p for p in ds_json["providers"] if p.get("id") == "bay2game"]
    
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(ds_json, f, indent=2, ensure_ascii=False)
    print("data_store.json updated: active_primary_provider_id set to bay2game only.")
