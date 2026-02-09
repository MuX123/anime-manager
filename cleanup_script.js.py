import os

file_path = r'd:\cod\GH\anime-manager\js\script.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Verify content before deletion to be extra safe
# Line indices are 0-based, so line 896 is index 895.
# Line 1297 is index 1296.

start_line_idx = 895 # Line 896
end_line_idx = 1296 # Line 1297

# Check start
if 'function renderGridCard' not in lines[start_line_idx]:
    print(f"Error: Line {start_line_idx+1} does not contain 'function renderGridCard'. Found: {lines[start_line_idx].strip()}")
    # Try fuzzy search around the area
    for i in range(max(0, start_line_idx - 10), min(len(lines), start_line_idx + 10)):
        if 'function renderGridCard' in lines[i]:
             print(f"Found it at {i+1}")
             start_line_idx = i
             break
    else:
        exit(1)

# Check end
if 'window.closeAnimeDetail' not in lines[end_line_idx]:
     print(f"Error: Line {end_line_idx+1} does not contain 'window.closeAnimeDetail'. Found: {lines[end_line_idx].strip()}")
     # Try fuzzy search around
     for i in range(max(0, end_line_idx - 10), min(len(lines), end_line_idx + 10)):
        if 'window.closeAnimeDetail' in lines[i]:
             print(f"Found it at {i+1}")
             end_line_idx = i
             break
     else:
        exit(1)

# Perform deletion
# We want to delete from start_line_idx up to and including end_line_idx
# Also remove a few lines before start_line_idx if they are just comments/empty space related to rendering
# Line 893 is // ========== 3. 布局渲染函數 ==========
# Line 891 is // 渲染邏輯已遷移至 js/render.js (Keep this or move it)

# Refined range:
# From line 893 (index 892) to line 1298 (index 1297, which is empty line after closeAnimeDetail)

real_start_idx = 892 # Line 893
real_end_idx = end_line_idx + 1 # Include the empty line after

print(f"Deleting from line {real_start_idx+1} to {real_end_idx+1}")

new_lines = lines[:real_start_idx] + lines[real_end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully removed lines.")
