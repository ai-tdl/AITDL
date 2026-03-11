import os
import glob

HEADER = """<!--
॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Web: https://aitdl.com

Historical Reference:
628 CE · Brahmasphuṭasiddhānta

Current Build:
8 March MMXXVI
Vikram Samvat 2082

Platform: AITDL Platform V3
Fingerprint: AITDL-PLATFORM-V3
-->
"""

def update_md_files(root_dir):
    updated_count = 0
    skipped_count = 0
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude node_modules, .git, .next, venv, etc.
        dirnames[:] = [d for d in dirnames if not d.startswith('.') and d not in ('node_modules', 'venv', '__pycache__')]
        
        for filename in filenames:
            if filename.endswith(".md"):
                file_path = os.path.join(dirpath, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    if "॥ ॐ श्री गणेशाय नमः ॥" not in content[:500]:
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(HEADER + content)
                        updated_count += 1
                        print(f"Updated: {file_path}")
                    else:
                        skipped_count += 1
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    
    print(f"\nDone. Updated: {updated_count}, Skipped: {skipped_count}")

if __name__ == "__main__":
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    update_md_files(root_dir)
