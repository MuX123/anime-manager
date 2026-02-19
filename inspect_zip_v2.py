import os
import zipfile
import sys

# 默認路徑
zip_path = r"D:\cod\GH\素材庫\滑鼠\furina_d965b215d4_VSTHEMES-ORG.zip"

if len(sys.argv) > 1:
    zip_path = sys.argv[1]

try:
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        print(f"Contents of {os.path.basename(zip_path)}:")
        for file in zip_ref.namelist():
            print(f"- {file}")
except Exception as e:
    print(f"Error: {e}")