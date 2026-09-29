import os
import zipfile

def build_zip():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    zip_path = os.path.join(base_dir, "apsara_backend.zip")

    # Files and folders to include in backend ZIP package
    targets = ["backend", "main.py", "passenger_wsgi.py", "requirements.txt", ".env.example"]

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for item in targets:
            item_path = os.path.join(base_dir, item)
            if not os.path.exists(item_path):
                continue
            if os.path.isfile(item_path):
                # Standardize zip entry path using forward slashes
                zf.write(item_path, item.replace("\\", "/"))
            elif os.path.isdir(item_path):
                for root, dirs, files in os.walk(item_path):
                    # Skip __pycache__ and git folders
                    if "__pycache__" in root or ".git" in root:
                        continue
                    for file in files:
                        if file.endswith(".pyc") or file.endswith(".pyo"):
                            continue
                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, base_dir)
                        # Always use forward slashes for Linux compatibility
                        zip_arcname = rel_path.replace("\\", "/")
                        zf.write(full_path, zip_arcname)

    print(f"[SUCCESS] Created Linux-compatible archive: {zip_path}")

if __name__ == "__main__":
    build_zip()
