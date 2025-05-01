#!/usr/bin/env python3
"""
Recursively writes the name and contents of every file under specified directories,
skipping any file or directory whose name is in SKIP_NAMES or that cannot be decoded as UTF-8.
"""
import os
from pathlib import Path

# Names of files or directories to skip entirely
SKIP_NAMES = {"node_modules", "package-lock.json"}


def write_files_in_dir(base_dir: Path, out_file):
    """
    Recursively writes the name and contents of every text file under base_dir,
    skipping any file or directory named in SKIP_NAMES or binary files.
    """
    if not base_dir.exists():
        return

    for root, dirs, files in os.walk(base_dir):
        # Filter out directories to skip
        dirs[:] = [d for d in dirs if d not in SKIP_NAMES]

        for fname in sorted(files):
            # Skip any blacklisted name
            if fname in SKIP_NAMES:
                continue

            file_path = Path(root) / fname
            rel_path = file_path.relative_to(script_dir)

            # Attempt to read as UTF-8 text, skip if binary or decode error
            try:
                content = file_path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, PermissionError):
                continue

            out_file.write(f"=== {rel_path} ===\n")
            out_file.write(content + "\n\n")


def main():
    global script_dir
    script_dir = Path(__file__).resolve().parent

    server_dir = script_dir / "server"
    client_dir = script_dir / "client"
    output_path = script_dir / "prompt.txt"

    with output_path.open("w", encoding="utf-8") as out:
        write_files_in_dir(server_dir, out)
        write_files_in_dir(client_dir, out)

    print(f"Written all filenames and contents to {output_path}")


if __name__ == "__main__":
    main()
