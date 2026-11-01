import io, re
p = 'js/ar.js'
t = io.open(p, encoding='utf-8').read()

# Mapeo de strings corruptos a su version correcta
reemplazos = [
    ('Apunt\u00ef\u00bf\u00bd a una tarjeta\u00ef\u00bf\u00bd', 'Apunt\u00e1 a una tarjeta\u2026'),
    ('Apunt\ufffd a una tarjeta\ufffd', 'Apunt\u00e1 a una tarjeta\u2026'),
    ('Prob\ufffd con \ufffdVer sin c\ufffdmara (demo)\ufffd o abr\ufffd la p\ufffdgina con HTTPS.',
     'Prob\u00e1 con \u00abVer sin c\u00e1mara (demo)\u00bb o abr\u00ed la p\u00e1gina con HTTPS.'),
    ('Prob\u00ef\u00bf\u00bd con \u00ef\u00bf\u00bdVer sin c\u00ef\u00bf\u00bdmara (demo)\u00ef\u00bf\u00bd o abr\u00ef\u00bf\u00bd la p\u00ef\u00bf\u00bdgina con HTTPS.',
     'Prob\u00e1 con \u00abVer sin c\u00e1mara (demo)\u00bb o abr\u00ed la p\u00e1gina con HTTPS.'),
]

# Detectar caracteres no-ASCII raros y mostrarlos
malos = set()
for ch in t:
    o = ord(ch)
    if o > 127 and not (0x00C0 <= o <= 0x024F or o in (0x2018,0x2019,0x201C,0x201D,0x2026,0x00AB,0x00BB,0x00B7,0x2192,0x2190)):
        malos.add(ch)
print('caracteres sospechosos:', [hex(ord(c)) for c in sorted(malos)])

# Reemplazar los patrones conocidos
for old, new in reemplazos:
    if old in t:
        t = t.replace(old, new)
        print('reemplazado:', old[:30])

# arreglar comentarios generales corruptos (opcion, no critico)
io.open(p, 'w', encoding='utf-8', newline='\n').write(t)
print('done')
