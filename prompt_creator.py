#!/usr/bin/env python3
from pathlib import Path

# Names of files or directories to skip entirely
SKIP_NAMES = {"node_modules", "package-lock.json"}

def write_files_in_dir(base_dir: Path, out_file, recurse_into=()):
    """
    Writes the name and contents of every file directly in `base_dir`,
    plus (optionally) files in any subdirectories listed in recurse_into.
    Always skips any name in SKIP_NAMES.
    """
    if not base_dir.exists():
        return

    for item in sorted(base_dir.iterdir()):
        # skip anything named in SKIP_NAMES
        if item.name in SKIP_NAMES:
            continue

        # if it's a file, write it
        if item.is_file():
            out_file.write(f"=== {item.relative_to(script_dir)} ===\n")
            out_file.write(item.read_text(encoding="utf-8") + "\n\n")

        # if it's an allowed subfolder, recurse one level down
        elif item.is_dir() and item.name in recurse_into:
            for sub in sorted(item.iterdir()):
                if sub.name in SKIP_NAMES:
                    continue
                if sub.is_file():
                    out_file.write(f"=== {sub.relative_to(script_dir)} ===\n")
                    out_file.write(sub.read_text(encoding="utf-8") + "\n\n")

def main():
    global script_dir
    script_dir = Path(__file__).resolve().parent

    server_dir = script_dir / "server"
    client_dir = script_dir / "client"
    output_path = script_dir / "prompt.txt"

    with output_path.open("w", encoding="utf-8") as out:
        write_files_in_dir(server_dir, out)                         # server/*
        write_files_in_dir(client_dir, out, recurse_into=("src",))  # client/* + client/src/*

    print(f"Written all filenames and contents to {output_path}")

if __name__ == "__main__":
    main()
