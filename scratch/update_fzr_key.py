import os
import json

NEW_KEY = "fc_121f96513332ffa0949d7eae"

# 1. Update .env
env_path = ".env"
if os.path.exists(env_path):
    env_content = open(env_path, "r", encoding="utf-8").read()
    if "FAZERCARDS_API_KEY" in env_content:
        lines = [line if not line.startswith("FAZERCARDS_API_KEY=") else f"FAZERCARDS_API_KEY={NEW_KEY}" for line in env_content.splitlines()]
        env_content = "\n".join(lines) + "\n"
    else:
        env_content += f"\n# FazerCards Wholesale API\nFAZERCARDS_API_KEY={NEW_KEY}\nFAZERCARDS_API_URL=https://api.fzr.cards/api/v2\n"
    open(env_path, "w", encoding="utf-8").write(env_content)
    print(".env updated with FAZERCARDS_API_KEY.")

# 2. Update backend/app/services/fazercards_service.py
svc_path = "backend/app/services/fazercards_service.py"
if os.path.exists(svc_path):
    svc_content = open(svc_path, "r", encoding="utf-8").read()
    svc_content = svc_content.replace('"fc_live_demo"', f'"{NEW_KEY}"').replace("'fc_live_demo'", f"'{NEW_KEY}'")
    open(svc_path, "w", encoding="utf-8").write(svc_content)
    print("fazercards_service.py default key updated.")

# 3. Update backend/app/data_store.py
ds_path = "backend/app/data_store.py"
if os.path.exists(ds_path):
    ds_content = open(ds_path, "r", encoding="utf-8").read()
    ds_content = ds_content.replace('"fc_live_demo"', f'"{NEW_KEY}"').replace("'fc_live_demo'", f"'{NEW_KEY}'")
    open(ds_path, "w", encoding="utf-8").write(ds_content)
    print("data_store.py updated.")

# 4. Update backend/app/data_store.json
json_path = "backend/app/data_store.json"
if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        ds_json = json.load(f)
    if "providers" in ds_json:
        for p in ds_json["providers"]:
            if p.get("id") == "fazercards":
                p["api_key"] = NEW_KEY
                p["status"] = "active"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(ds_json, f, indent=2)
    print("data_store.json updated.")
