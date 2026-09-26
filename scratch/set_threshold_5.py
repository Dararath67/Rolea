import os
import json

ds_path = "backend/app/data_store.py"
content = open(ds_path, "r", encoding="utf-8").read()
if "provider_low_balance_threshold" in content:
    content = content.replace("provider_low_balance_threshold = 50.0", "provider_low_balance_threshold = 5.0")
    content = content.replace("provider_low_balance_threshold: float = 50.0", "provider_low_balance_threshold: float = 5.0")
else:
    content = content.replace('self.active_primary_provider_id: str = "bay2game"', 'self.active_primary_provider_id: str = "bay2game"\n        self.provider_low_balance_threshold: float = 5.0')

open(ds_path, "w", encoding="utf-8").write(content)
print("data_store.py updated with threshold 5.0.")

json_path = "backend/app/data_store.json"
if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        d = json.load(f)
    d["provider_low_balance_threshold"] = 5.0
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
    print("data_store.json updated with threshold 5.0.")
