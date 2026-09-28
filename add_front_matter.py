import os
import yaml

MKDOCS_YML_PATH = "mkdocs.yml"
DOCS_DIR = os.path.join("docs", "songs")

COMMON_TITLE_SUFFIX = " - ときのそら 時乃空 Tokino Sora"
DESCRIPTION_TEMPLATE = (
    'ときのそら (Tokino Sora)《{}》歌曲資訊：含歌詞、羅馬拼音 (Romaji)、'
    '歌詞翻譯 (Translations)、Call (コール)、與和弦 (Chords)。'
)

def extract_songs_from_nav(nav_list):
    """
    Recursively scans the nav list to find items under the '🎵 歌 Songs' section.
    """
    song_map = {}

    def parse_item(item):
        if isinstance(item, dict):
            for key, value in item.items():
                if isinstance(value, list):
                    for sub_item in value:
                        parse_item(sub_item)
                elif isinstance(value, str):
                    # Normalize slashes for cross-platform compatibility
                    normalized_path = os.path.normpath(value)
                    song_map[normalized_path] = key
        elif isinstance(item, list):
            for sub_item in item:
                parse_item(sub_item)

    for nav_item in nav_list:
        if isinstance(nav_item, dict) and '🎵 歌 Songs' in nav_item:
            parse_item(nav_item['🎵 歌 Songs'])
            break

    return song_map

def update_md_front_matter(rel_path, song_title):
    # Construct full path pointing to \docs\songs or \docs\...
    full_path = os.path.join("docs", rel_path)

    if not os.path.exists(full_path):
        print(f"⚠️ File not found: {full_path}")
        return

    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Skip if front matter already exists
    if content.startswith("---"):
        print(f"⏭️ Skipping {full_path} (Front matter already present)")
        return

    # Clean quotes inside title if any exist
    clean_title = song_title.replace('"', '\\"')

    front_matter = (
        f"---\n"
        f'title: "{clean_title}{COMMON_TITLE_SUFFIX}"\n'
        f'description: "{DESCRIPTION_TEMPLATE.format(clean_title)}"\n'
        f"---\n\n"
    )

    new_content = front_matter + content

    with open(full_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"✅ Updated: {full_path} -> Title: {song_title}")

def main():
    if not os.path.exists(MKDOCS_YML_PATH):
        print(f"❌ Error: {MKDOCS_YML_PATH} not found in current directory.")
        return

    with open(MKDOCS_YML_PATH, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    nav = config.get("nav", [])
    song_map = extract_songs_from_nav(nav)

    print(f"Found {len(song_map)} song files listed under '🎵 歌 Songs'.\n")

    for md_file, title in song_map.items():
        # Skip overview / index files
        if md_file.endswith("songs_index.md"):
            continue
        update_md_front_matter(md_file, title)

if __name__ == "__main__":
    main()