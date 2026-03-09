import os

def generate_tree(dir_path, prefix="", ignore_dirs=None):
    if ignore_dirs is None:
        ignore_dirs = {'.git', '__pycache__', 'venv', 'env', 'node_modules', '.pytest_cache'}
    
    tree_str = ""
    
    try:
        entries = sorted(os.listdir(dir_path))
    except PermissionError:
        return ""
        
    # Filter out ignored directories
    entries = [e for e in entries if not (os.path.isdir(os.path.join(dir_path, e)) and e in ignore_dirs)]
    
    entries_count = len(entries)
    for index, entry in enumerate(entries):
        path = os.path.join(dir_path, entry)
        is_last = index == (entries_count - 1)
        
        connector = "└── " if is_last else "├── "
        tree_str += f"{prefix}{connector}{entry}\n"
        
        if os.path.isdir(path):
            extension = "    " if is_last else "│   "
            tree_str += generate_tree(path, prefix=prefix + extension, ignore_dirs=ignore_dirs)
            
    return tree_str

def export_skeleton():
    root_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    output_file = os.path.join(root_dir, "aitdl_v3_architecture_skeleton.md")
    
    key_files_to_include = [
        "backend/main.py",
        "backend/services/product_loader.py",
        "backend/services/plugin_loader.py",
        "backend/services/hooks.py",
        "backend/services/ai_gateway.py",
        "products/ganitsutram/product.json",
        "plugins/ai-assistant/plugin.json",
        "plugins/ai-assistant/hooks.py",
        "themes/default/theme.json"
    ]
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# AITDL V3 Modular Ecosystem - Architectural Skeleton\n\n")
        f.write("This document provides a high-level overview of the AITDL V3 modular architecture, including the directory structure and the core loader/registry implementations. It is intended for third-party architectural review.\n\n")
        
        f.write("## Directory Structure\n\n")
        f.write("```text\n")
        f.write("AITDL/\n")
        f.write(generate_tree(root_dir))
        f.write("```\n\n")
        
        f.write("## Core Architecture & Loaders\n\n")
        f.write("The platform utilizes dynamic loaders to scan and mount isolated Products and Plugins at runtime without mutating core application code.\n\n")
        
        for rel_path in key_files_to_include:
            abs_path = os.path.join(root_dir, rel_path)
            if os.path.exists(abs_path):
                f.write(f"### `{rel_path}`\n")
                ext = rel_path.split('.')[-1]
                lang = ext if ext in ['py', 'json', 'js', 'html', 'css'] else 'text'
                f.write(f"```{lang}\n")
                with open(abs_path, 'r', encoding='utf-8') as src:
                    f.write(src.read())
                f.write("\n```\n\n")
                
    print(f"Skeleton exported successfully to: {output_file}")

if __name__ == "__main__":
    export_skeleton()
