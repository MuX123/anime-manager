import os
import zipfile
import struct
import io
import json
import shutil
from PIL import Image

source_dir = r"D:\cod\GH\素材庫\滑鼠"
target_dir = r"D:\cod\GH\anime-manager\assets\cursors"
config_path = "themes_config_final.json"

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

# --- Helpers ---
def parse_ani(file_data):
    # (Same ANI parser as before)
    frames = []
    durations = []
    try:
        if file_data[:4] != b'RIFF': return None
        # ... (Simplified for brevity, assuming full logic from previous turn)
        # Using the robust logic
        offset = 12
        frames_data = []; rates = []; seq = []
        default_rate = 0
        
        while offset < len(file_data):
            chunk_id = file_data[offset:offset+4]
            if len(chunk_id) < 4: break
            chunk_size = struct.unpack('<I', file_data[offset+4:offset+8])[0]
            chunk_data_offset = offset + 8
            
            if chunk_id == b'anih':
                cSteps = struct.unpack('<I', file_data[chunk_data_offset+8:chunk_data_offset+12])[0]
                default_rate = struct.unpack('<I', file_data[chunk_data_offset+24:chunk_data_offset+28])[0]
            elif chunk_id == b'rate':
                count = chunk_size // 4
                rates = list(struct.unpack(f'<{count}I', file_data[chunk_data_offset:chunk_data_offset+chunk_size]))
            elif chunk_id == b'seq ':
                count = chunk_size // 4
                seq = list(struct.unpack(f'<{count}I', file_data[chunk_data_offset:chunk_data_offset+chunk_size]))
            elif chunk_id == b'LIST':
                if file_data[chunk_data_offset:chunk_data_offset+4] == b'fram':
                    sub_pos = chunk_data_offset + 4
                    sub_end = chunk_data_offset + chunk_size
                    while sub_pos < sub_end:
                        sub_id = file_data[sub_pos:sub_pos+4]
                        sub_size = struct.unpack('<I', file_data[sub_pos+4:sub_pos+8])[0]
                        if sub_id == b'icon':
                            frames_data.append(file_data[sub_pos+8 : sub_pos+8+sub_size])
                        sub_pos += 8 + sub_size + (sub_size % 2)
            offset += 8 + chunk_size + (chunk_size % 2)

        if not frames_data: return None
        if not seq: seq = list(range(len(frames_data)))
        if not rates: rates = [default_rate] * len(seq)
        if len(rates) < len(seq): rates.extend([default_rate] * (len(seq) - len(rates)))

        result = []
        for i, idx in enumerate(seq):
            if idx < len(frames_data):
                try:
                    img = Image.open(io.BytesIO(frames_data[idx]))
                    dur = int(rates[i] * (1000.0/60.0))
                    result.append((img, dur))
                except: pass
        return result
    except: return None

def resize_image_content(img, target_size=(320, 320), offset=(40, 40)):
    """
    Resizes image to fit reasonably (e.g. 64x64 -> 64x64 or scaled up if tiny?)
    Actually, we generally want to KEEP the pixel art crisp or resize smoothly.
    But crucial: Paste at OFFSET.
    """
    img = img.convert('RGBA')
    
    # Logic: If image is small (<= 64x64), keep size (or 2x?). 
    # If we resize, we change the tip position relative to top-left.
    # Usually we want to scale it to be visible.
    # Target display is 32x32. 
    # We are generating 320x320 assets.
    # If we put a 32x32 image at (40, 40) in 320x320 canvas.
    # When displayed at 32x32 (1/10th), it becomes 3.2x3.2 at (4, 4). Too small!
    
    # We want the cursor to fill a good portion of the 320x320 canvas?
    # No, we want the cursor to appear as ~32px on screen.
    # If the canvas is 320px and mapped to 32px screen (10x downscale).
    # Then the cursor drawing inside 320px canvas should be ~320px large?
    # YES. We need to UPSCALES the source image to fill the canvas!
    
    # Source: 32x32 (usually).
    # Target: 320x320.
    # Scale: 10x (or slightly less to fit padding).
    # Let's scale it to fit 240x240?
    
    # Calculate scale to fit e.g. 200px box?
    # Or just use the 'contain' logic but anchored at Top-Left.
    
    # New logic:
    # Scale image to be roughly 240px wide/high (leaving room).
    # Maintain aspect ratio.
    # Paste such that the "Tip" (0,0 of source) ends up at (40, 40) of target?
    # NO. If we scale by 10x, (0,0) stays (0,0).
    # But we want padding?
    # If we want hotspot at (40, 40) in 320px space (which is 4px in 32px space).
    # And we want the tip of the cursor at that hotspot.
    # Then the tip of the cursor should be at (40, 40).
    # So we paste the Scaled Image at (40, 40).
    
    # Scaling factor:
    # If source is 32x32. Target effective size ~320. Scale ~8-10x.
    # Let's say we scale by min(320/w, 320/h) * 0.8 (80% fill).
    
    scale_factor = min(target_size[0]/img.width, target_size[1]/img.height) * 0.8
    # Actually, let's limit max scale to avoid blur if not pixel art? 
    # User said "LANCZOS".
    
    new_w = int(img.width * scale_factor)
    new_h = int(img.height * scale_factor)
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    canvas = Image.new('RGBA', target_size, (0, 0, 0, 0))
    # Paste at (40, 40)
    canvas.paste(resized, offset)
    
    return canvas

def process_file(source_file, target_path, is_ani=False):
    frames = []
    durations = []
    
    if is_ani:
        # Read ANI
        parsed = parse_ani(open(source_file, 'rb').read())
        if parsed:
            for img, dur in parsed:
                frames.append(resize_image_content(img))
                durations.append(dur)
    else:
        # Read GIF/Static
        try:
            with Image.open(source_file) as im:
                dur = im.info.get('duration', 100)
                try:
                    while True:
                        frames.append(resize_image_content(im.copy()))
                        durations.append(dur)
                        im.seek(im.tell() + 1)
                except EOFError: pass
        except: pass

    if frames:
        duration = durations if len(set(durations)) > 1 else durations[0]
        frames[0].save(target_path, save_all=True, append_images=frames[1:], loop=0, duration=duration, disposal=2)
        return True
    return False

# ... (Main loop iterating zips, extracting to temp, calling process_file) ...
# I will implement this fully in the file `process_all_fixed.py`
