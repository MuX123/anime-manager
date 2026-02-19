import os
import zipfile
import struct
import io
import json
from PIL import Image

source_dir = r"D:\cod\GH\素材庫\滑鼠"
target_dir = r"D:\cod\GH\anime-manager\assets\cursors"
config_path = "themes_config_v2.json"

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

# Load existing config
with open(config_path, 'r', encoding='utf-8') as f:
    themes_config = json.load(f)

# --- ANI Parser ---
def parse_ani(file_data):
    """
    Parses an ANI file binary data and returns a list of frames (PIL Images) and durations (ms).
    """
    frames = []
    durations = []
    
    try:
        if file_data[:4] != b'RIFF':
            return None, None
            
        riff_len = struct.unpack('<I', file_data[4:8])[0]
        if file_data[8:12] != b'ACON':
            return None, None
            
        # Parse chunks
        pos = 12
        display_rate = 0
        rate_chunk = []
        seq_chunk = []
        icon_chunks = []
        
        while pos < len(file_data):
            if pos + 8 > len(file_data): break
            
            chunk_id = file_data[pos:pos+4]
            chunk_size = struct.unpack('<I', file_data[pos+4:pos+8])[0]
            pos += 8
            
            # Handle padding (chunks are word-aligned)
            # data_end = pos + chunk_size
            # next_pos = data_end + (data_end % 2)
            
            if chunk_id == b'anih':
                # ANI Header
                # struct ANIHeader {
                #   DWORD cbSize; (36 bytes)
                #   DWORD cFrames;
                #   DWORD cSteps;
                #   DWORD cx, cy;
                #   DWORD cBitCount, cPlanes;
                #   DWORD JifRate;
                #   DWORD flags;
                # }
                if chunk_size >= 36:
                    header_data = file_data[pos:pos+36]
                    cbSize, cFrames, cSteps, cx, cy, cBit, cPlanes, jifRate, flags = struct.unpack('<9I', header_data)
                    display_rate = jifRate
            
            elif chunk_id == b'rate':
                # Rate chunk: array of DWORDs (jiffies) for each step
                count = chunk_size // 4
                rate_chunk = list(struct.unpack(f'<{count}I', file_data[pos:pos+chunk_size]))
                
            elif chunk_id == b'seq ':
                # Sequence chunk: array of DWORDs (frame indices) for each step
                count = chunk_size // 4
                seq_chunk = list(struct.unpack(f'<{count}I', file_data[pos:pos+chunk_size]))
                
            elif chunk_id == b'LIST':
                # Sub-list, likely 'fram' containing icons
                list_type = file_data[pos:pos+4]
                if list_type == b'fram':
                    # This list contains icon chunks
                    # We need to parse inside this list
                    sub_pos = pos + 4
                    sub_end = pos + chunk_size
                    while sub_pos < sub_end:
                        sub_id = file_data[sub_pos:sub_pos+4]
                        sub_size = struct.unpack('<I', file_data[sub_pos+4:sub_pos+8])[0]
                        sub_pos += 8
                        
                        if sub_id == b'icon':
                            icon_data = file_data[sub_pos:sub_pos+sub_size]
                            icon_chunks.append(icon_data)
                        
                        sub_pos += sub_size
                        if sub_size % 2 != 0: sub_pos += 1
            
            pos += chunk_size
            if chunk_size % 2 != 0: pos += 1
            
        # Process frames
        # If seq is missing, use 0..N-1
        if not seq_chunk:
            seq_chunk = list(range(len(icon_chunks)))
            
        # If rate is missing, use display_rate for all
        if not rate_chunk:
            rate_chunk = [display_rate] * len(seq_chunk)
            
        # Extract images
        pil_frames = []
        for icon_data in icon_chunks:
            try:
                # Try opening as CUR/ICO
                img = Image.open(io.BytesIO(icon_data))
                pil_frames.append(img)
            except Exception as e:
                print(f"    Failed to load icon frame: {e}")
                pil_frames.append(None)
                
        # Build final sequence
        final_frames = []
        final_durations = []
        
        for i, frame_idx in enumerate(seq_chunk):
            if frame_idx < len(pil_frames) and pil_frames[frame_idx]:
                final_frames.append(pil_frames[frame_idx])
                # Convert jiffies (1/60s) to ms
                duration_jiffies = rate_chunk[i] if i < len(rate_chunk) else display_rate
                duration_ms = int(duration_jiffies * (1000.0 / 60.0))
                final_durations.append(duration_ms)
                
        return final_frames, final_durations

    except Exception as e:
        print(f"  ANI Parse Error: {e}")
        return None, None

def resize_and_save_gif(frames, durations, output_path, size=(320, 320)):
    if not frames: return False
    
    resized_frames = []
    try:
        for frame in frames:
            frame = frame.convert('RGBA')
            
            # Create standardized canvas
            canvas = Image.new('RGBA', size, (0, 0, 0, 0))
            
            # Calculate resize ratio
            ratio = min(size[0] / frame.width, size[1] / frame.height)
            new_size = (int(frame.width * ratio), int(frame.height * ratio))
            
            # Resize
            frame_resized = frame.resize(new_size, Image.Resampling.LANCZOS)
            
            # Center paste
            pos = ((size[0] - new_size[0]) // 2, (size[1] - new_size[1]) // 2)
            canvas.paste(frame_resized, pos)
            
            resized_frames.append(canvas)
            
        # Save as GIF
        # Duration is avg or list? PIL save expects duration per frame or single int
        # If durations vary, we need to be careful. PIL uses 'duration' in ms.
        # It accepts a list of durations or a single integer.
        # But wait, does PIL save accept a list for duration?
        # Yes, since Pillow 10.0+ it should (or maybe earlier). Let's try passing list.
        # Actually, let's pass the first duration if constant, or list if variable.
        
        duration_arg = durations if len(set(durations)) > 1 else durations[0]
        
        resized_frames[0].save(
            output_path,
            save_all=True,
            append_images=resized_frames[1:],
            loop=0,
            duration=duration_arg,
            disposal=2
        )
        return True
    except Exception as e:
        print(f"    Error saving GIF {output_path}: {e}")
        return False

# --- Main Logic ---

existing_themes = set(themes_config.keys())

for filename in os.listdir(source_dir):
    if not filename.endswith(".zip"):
        continue
        
    # ID Logic
    theme_id = filename.lower()
    for suffix in ['.zip', '_vsthemes-org', '_vsthemes', '-org']:
        theme_id = theme_id.replace(suffix, '')
    for game in ['_wuwa', '_honkai', '_genshin', '_zzz', '_arknights', '-wuwa', '-honkai', '-genshin', '-zzz', '-arknights']:
        theme_id = theme_id.replace(game, '')
    theme_id = theme_id.replace('-', '_').strip('_')
    
    if 'amiya' in theme_id: theme_id = 'amiya'
    if 'elysia' in theme_id: theme_id = 'elysia'

    # Process only if NOT existing (or force update for 'furina' since we know it failed)
    if theme_id in existing_themes and 'furina' not in theme_id:
        continue
        
    print(f"Processing ANI for: {filename} -> {theme_id}")
    
    theme_path = os.path.join(target_dir, theme_id)
    if not os.path.exists(theme_path):
        os.makedirs(theme_path)
        
    zip_path = os.path.join(source_dir, filename)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            # Find ANI files
            ani_files = [f for f in z.namelist() if f.endswith('.ani')]
            if not ani_files:
                print(f"  No ANI files found")
                continue
                
            mapping = {
                'pointer': 'default.gif',
                'normal': 'default.gif',
                'arrow': 'default.gif',
                'link': 'pointer.gif',
                'hand': 'pointer.gif',
                'text': 'text.gif',
                'beam': 'text.gif',
                'help': 'help.gif',
                'busy': 'help.gif' # Map busy to help for now
            }
            
            found_files = set()
            
            for f in ani_files:
                base = os.path.basename(f).lower().replace('.ani', '')
                
                target = None
                for key, val in mapping.items():
                    if key in base:
                        target = val
                        break
                
                if not target:
                    continue
                    
                target_file = os.path.join(theme_path, target)
                if target in found_files:
                    continue

                # Extract ANI to memory
                ani_data = z.read(f)
                
                # Parse
                frames, durations = parse_ani(ani_data)
                
                if frames and len(frames) > 0:
                    if resize_and_save_gif(frames, durations, target_file):
                        print(f"  Converted {base}.ani -> {target} (Frames: {len(frames)})")
                        found_files.add(target)
                else:
                    print(f"  Failed to parse/extract frames from {base}.ani")

            if found_files:
                themes_config[theme_id] = {
                    'name': theme_id.replace('_', ' ').title(),
                    'folder': theme_id,
                    'hotspotX': 4, # Standardized for 32px display size (original 320px -> hotspot ~40px, but mapped to 32px -> ~4px)
                    'hotspotY': 4,
                    'files': {
                        'default': 'default.gif',
                        'pointer': 'pointer.gif',
                        'text': 'text.gif',
                        'help': 'help.gif'
                    }
                }
                
    except Exception as e:
        print(f"Error processing {filename}: {e}")

# Save updated config
with open('themes_config_v3.json', 'w', encoding='utf-8') as f:
    json.dump(themes_config, f, indent=4, ensure_ascii=False)
    
print("Done. Saved to themes_config_v3.json")
