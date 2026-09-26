import re

html = open('scratch/digitalsoft_docs.html', 'r', encoding='utf-8').read()
text = re.sub('<[^<]+?>', ' ', html)

lines = [l.strip() for l in text.splitlines() if l.strip()]
for i, l in enumerate(lines):
    if 'beli' in l.lower() or 'daftar' in l.lower() or 'harga' in l.lower() or 'paket' in l.lower() or 'kontak' in l.lower() or 'key' in l.lower():
        print(f"[{i}] {l}")
