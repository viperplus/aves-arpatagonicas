import re, json
t = open('js/sonidos.js', encoding='utf-8').read()
ids = re.findall(r'"?([a-z-]+)"?\s*:\s*\{[^}]*archivo\s*:\s*"([^"]+)"', t)
print('entries', len(ids))
for i, a in ids:
    print(i, '->', a)
# check all 22 ids present
import os
missing = []
for i, a in ids:
    if not os.path.exists('sonidos/'+a):
        missing.append((i, a))
print('missing files:', missing)
