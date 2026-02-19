import re
import json

name_mapping = {
    'amiya': '阿米婭 (明日方舟)',
    'brant': 'Brant (鳴潮)',
    'burnice_white': '柏妮思 (絕區零)',
    'chibi_firefly': '流螢 Q版 (星鐵)',
    'chibi_mydei': 'Mydei Q版 (崩壞)',
    'chibi_phainon': 'Phainon Q版 (崩壞)',
    'chibi_phrolova': '弗洛洛 Q版 (鳴潮)',
    'chibi_roccia': 'Roccia Q版 (鳴潮)',
    'chibi_zhao': 'Zhao Q版 (絕區零)',
    'chisa': '熾霞 (鳴潮)',
    'citlali': '茜特菈莉 (原神)',
    'evernight': '永夜 (崩壞)',
    'furina': '芙寧娜 (原神)',
    'iuno': 'Iuno (鳴潮)',
    'natsume_an': '棗安安',
    'sakuraba_ema': '櫻庭繪馬',
    'anya': '🦊 阿尼亞',
    'frieren': '🧙‍♀️ 芙莉蓮',
    'elysia': '🦋 愛莉希雅'
}

js_path = 'js/atmosphere.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Debug log
log = open('rename_debug.log', 'w', encoding='utf-8')

# Pattern
pattern = r"([a-zA-Z0-9_]+)\s*:\s*\{\s*(['\"]?)name\2\s*:\s*(['\"])(.*?)\3"

def replace_name(match):
    key = match.group(1)
    name_quote = match.group(2)
    val_quote = match.group(3)
    old_name = match.group(4)
    
    new_name = old_name
    found = False
    for map_key, map_name in name_mapping.items():
        if map_key in key:
            new_name = map_name
            found = True
            break
            
    log.write(f"Match: {key}, Old: {old_name}, New: {new_name}\n")
    
    return f'{key}: {{ {name_quote}name{name_quote}: {val_quote}{new_name}{val_quote}'

new_content = re.sub(pattern, replace_name, content)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

log.close()
print("Done v4")
