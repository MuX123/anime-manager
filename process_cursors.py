import os
import zipfile
import shutil
import json

source_dir = r"D:\cod\GH\素材庫\滑鼠"
target_dir = r"D:\cod\GH\anime-manager\assets\cursors"

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

themes_config = {}

for filename in os.listdir(source_dir):
    if not filename.endswith(".zip"):
        continue
        
    # 清理 ID
    theme_id = filename.lower()
    for suffix in ['.zip', '_vsthemes-org', '_vsthemes', '-org']:
        theme_id = theme_id.replace(suffix, '')
    
    # 移除遊戲後綴以縮短名稱
    for game in ['_wuwa', '_honkai', '_genshin', '_zzz', '_arknights', '-wuwa', '-honkai', '-genshin', '-zzz', '-arknights']:
        theme_id = theme_id.replace(game, '')
        
    theme_id = theme_id.replace('-', '_').strip('_')
    
    # 特殊處理
    if 'amiya' in theme_id: theme_id = 'amiya'
    if 'elysia' in theme_id: theme_id = 'elysia'
    
    print(f"Processing: {filename} -> {theme_id}")
    
    theme_path = os.path.join(target_dir, theme_id)
    if not os.path.exists(theme_path):
        os.makedirs(theme_path)
        
    zip_path = os.path.join(source_dir, filename)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            gif_files = [f for f in z.namelist() if 'Gifs/' in f and f.endswith('.gif')]
            
            if not gif_files:
                # 嘗試尋找根目錄的 gif (有些包可能沒有 Gifs 資料夾)
                gif_files = [f for f in z.namelist() if f.endswith('.gif') and '/' not in f]
            
            if not gif_files:
                print(f"  No Gifs found")
                continue
                
            # 映射規則 (優先級：全名匹配 > 關鍵字匹配)
            mapping = {
                'pointer.gif': 'default.gif', # VSThemes 的 pointer 通常是普通箭頭
                'normal.gif': 'default.gif',
                'arrow.gif': 'default.gif',
                '1.gif': 'default.gif',
                
                'link.gif': 'pointer.gif',
                'hand.gif': 'pointer.gif',
                '2.gif': 'pointer.gif',
                
                'text.gif': 'text.gif',
                'beam.gif': 'text.gif',
                
                'help.gif': 'help.gif'
            }
            
            found_files = set()
            
            for f in gif_files:
                base = os.path.basename(f).lower()
                target = mapping.get(base)
                
                if not target:
                    if 'normal' in base or 'pointer' in base: target = 'default.gif'
                    elif 'link' in base or 'hand' in base: target = 'pointer.gif'
                    elif 'text' in base: target = 'text.gif'
                    elif 'help' in base: target = 'help.gif'
                
                if target:
                    target_file = os.path.join(theme_path, target)
                    # 不覆蓋已存在的 (除非是更精確的匹配)
                    if target not in found_files:
                        with open(target_file, 'wb') as out:
                            out.write(z.read(f))
                        found_files.add(target)
                        print(f"  Extracted {base} -> {target}")

            themes_config[theme_id] = {
                'name': theme_id.replace('_', ' ').title(),
                'folder': theme_id,
                'hotspotX': 4,
                'hotspotY': 4,
                'files': {
                    'default': 'default.gif',
                    'pointer': 'pointer.gif',
                    'text': 'text.gif',
                    'help': 'help.gif'
                }
            }
            
    except Exception as e:
        print(f"Error: {e}")

with open('themes_config.json', 'w', encoding='utf-8') as f:
    json.dump(themes_config, f, indent=4, ensure_ascii=False)