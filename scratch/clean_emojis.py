import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def clean_file(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            modified = True
            print(f"Replaced in {filepath}")
            
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
# 1. admin/page.tsx
clean_file('src/app/admin/page.tsx', [
    ('✓ ENABLED (បើកដំណើរការ)', 'ENABLED (បើកដំណើរការ)'),
    ('✕ DISABLED (បិទ)', 'DISABLED (បិទ)'),
    ('\ufe0f Vouchers & Cards', 'Vouchers & Cards'),
    ('\ufe0f Voucher', 'Voucher'),
    ('\ufe0f Game Vouchers & Cards', 'Game Vouchers & Cards'),
])

# 2. dashboard/page.tsx
clean_file('src/app/dashboard/page.tsx', [
    ('⚡ ប្រើឥឡូវនេះ', 'ប្រើឥឡូវនេះ'),
    ('⚡', ''),
])

# 3. BannerEditor.tsx
clean_file('src/app/admin/components/BannerEditor.tsx', [
    ('● ON (Active)', 'ON (Active)'),
    ('○ OFF (Hidden)', 'OFF (Hidden)'),
    ('● Dynamic Real-time Sync', 'Dynamic Real-time Sync'),
    ('● Photo', 'Photo'),
])

print("Clean script completed.")
