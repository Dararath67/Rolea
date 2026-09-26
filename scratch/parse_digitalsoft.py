import re

html = open('scratch/digitalsoft_docs.html', 'r', encoding='utf-8').read()
text = re.sub('<[^<]+?>', ' ', html)

out = []
for line in text.splitlines():
    l = line.strip()
    if l and any(k in l.lower() for k in ['check', 'game', 'api', 'v1', 'v2', 'endpoint', 'nickname', 'player', 'role']):
        out.append(l)

open('scratch/parsed_digitalsoft.txt', 'w', encoding='utf-8').write('\n'.join(out[:100]))
print("Parsed lines count:", len(out))
