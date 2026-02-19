import os
import zipfile

zip_path = r"D:\cod\GH\素材庫\滑鼠\amiya-arknights.zip"

try:
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        print(f"Contents of {os.path.basename(zip_path)}:")
        for file in zip_ref.namelist():
            print(f"- {file}")
except Exception as e:
    print(f"Error: {e}")