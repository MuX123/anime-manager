import os
import zipfile
import shutil
import json
from PIL import Image

source_dir = r"D:\cod\GH\素材庫\滑鼠"
target_dir = r"D:\cod\GH\anime-manager\assets\cursors"

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

def resize_gif(input_path, output_path, size=(320, 320)):
    try:
        with Image.open(input_path) as im:
            duration = im.info.get('duration', 100)
            frames = []
            try:
                while True:
                    frame = im.convert('RGBA')
                    canvas = Image.new('RGBA', size, (0, 0, 0, 0))
                    
                    # 保持比例縮放
                    ratio = min(size[0] / frame.width, size[1] / frame.height)
                    # 如果圖片小於目標，放大；如果大於，縮小
                    new_size = (int(frame.width * ratio), int(frame.height * ratio))
                    
                    # 使用 NEAREST 保持像素風格（如果是像素游標），或者 LANCZOS 平滑
                    # 既然是 "滑鼠風格"，假設清晰度優先，用 LANCZOS
                    frame = frame.resize(new_size, Image.Resampling.LANCZOS)
                    
                    pos = ((size[0] - new_size[0]) // 2, (size[1] - new_size[1]) // 2)
                    canvas.paste(frame, pos)
                    
                    frames.append(canvas)
                    im.seek(im.tell() + 1)
            except EOFError:
                pass
                
            if frames:
                frames[0].save(output_path, save_all=True, append_images=frames[1:], loop=0, duration=duration, disposal=2)
                return True
    except Exception as e:
        print(f"    Error resizing {input_path}: {e}")
        return False

themes_config = {}

for filename in os.listdir(source_dir):
    if not filename.endswith(".zip"):
        continue
        
    theme_id = filename.lower()
    for suffix in ['.zip', '_vsthemes-org', '_vsthemes', '-org']:
        theme_id = theme_id.replace(suffix, '')
    
    for game in ['_wuwa', '_honkai', '_genshin', '_zzz', '_arknights', '-wuwa', '-honkai', '-genshin', '-zzz', '-arknights']:
        theme_id = theme_id.replace(game, '')
        
    theme_id = theme_id.replace('-', '_').strip('_')
    
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
                gif_files = [f for f in z.namelist() if f.endswith('.gif') and '/' not in f]
            
            if not gif_files:
                print(f"  No Gifs found, skipping")
                continue
                
            mapping = {
                'pointer.gif': 'default.gif',
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
            temp_extract_dir = os.path.join(theme_path, 'temp_extract')
            if not os.path.exists(temp_extract_dir):
                os.makedirs(temp_extract_dir)

            for f in gif_files:
                base = os.path.basename(f).lower()
                target = mapping.get(base)
                
                if not target:
                    if 'normal' in base or 'pointer' in base: target = 'default.gif'
                    elif 'link' in base or 'hand' in base: target = 'pointer.gif'
                    elif 'text' in base: target = 'text.gif'
                    elif 'help' in base: target = 'help.gif'
                
                if target:
                    # 先解壓到臨時目錄
                    temp_file = os.path.join(temp_extract_dir, base)
                    with open(temp_file, 'wb') as out:
                        out.write(z.read(f))
                    
                    # 轉換並調整大小到目標目錄
                    target_file = os.path.join(theme_path, target)
                    if target not in found_files:
                        if resize_gif(temp_file, target_file):
                            found_files.add(target)
                            print(f"  Processed {base} -> {target} (320x320)")
            
            # 清理臨時目錄
            shutil.rmtree(temp_extract_dir)

            if found_files:
                themes_config[theme_id] = {
                    'name': theme_id.replace('_', ' ').title(),
                    'folder': theme_id,
                    'hotspotX': 40, # 320x320 的中心點大概是 40? 不，這取決於圖。這裡設為 40 (1/8)
                    'hotspotY': 40,
                    'files': {
                        'default': 'default.gif',
                        'pointer': 'pointer.gif',
                        'text': 'text.gif',
                        'help': 'help.gif'
                    }
                }
            
    except Exception as e:
        print(f"Error: {e}")

with open('themes_config_v2.json', 'w', encoding='utf-8') as f:
    json.dump(themes_config, f, indent=4, ensure_ascii=False)