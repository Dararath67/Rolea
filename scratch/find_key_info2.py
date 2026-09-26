import re

html = open('scratch/digitalsoft_docs.html', 'r', encoding='utf-8').read()
text = re.sub('<[^<]+?>', ' ', html)

lines = [l.strip() for l in text.splitlines() if l.strip()]
out = []
for i, l in enumerate(lines):
    if any(k in l.lower() for k in ['beli', 'daftar', 'harga', 'paket', 'kontak', 'key', 'order', 'whatsapp', 'telegram', 'domain']):
        out.append(f"[{i}] {l}")

open('scratch/key_info_out.txt', 'w', encoding='utf-8').write('\n'.join(out))
print("Saved key info output lines:", len(out))
