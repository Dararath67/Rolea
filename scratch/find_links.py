import re

html = open('scratch/digitalsoft_docs.html', 'r', encoding='utf-8').read()
links = re.findall(r'href=["\'](https?://[^"\']+)["\']', html)
print("--- ALL EXTERNAL LINKS ---")
for l in set(links):
    print(l)
