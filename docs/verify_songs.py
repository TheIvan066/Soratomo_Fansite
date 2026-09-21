import os
import json


def check_and_generate_unlisted(
        song_list_path=os.path.join("docs", "data", "song_list.json"),
        songs_dir=os.path.join("docs", "data", "songs"),
        output_unlisted_path=os.path.join("docs", "data", "unlisted_songs.json")):

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)


    resolved_song_list_path = os.path.abspath(song_list_path) if os.path.exists(song_list_path) else os.path.join(
        project_root, song_list_path)
    resolved_songs_dir = os.path.abspath(songs_dir) if os.path.exists(songs_dir) else os.path.join(project_root,
                                                                                                   songs_dir)
    resolved_output_path = os.path.abspath(output_unlisted_path) if os.path.exists(
        os.path.dirname(output_unlisted_path)) else os.path.join(project_root, output_unlisted_path)


    if not os.path.exists(resolved_song_list_path):
        print(f"Error: Couldn't find '{resolved_song_list_path}'.")
        return

    try:
        with open(resolved_song_list_path, "r", encoding="utf-8") as f:
            song_list = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing '{resolved_song_list_path}': {e}")
        return


    expected_files = {}
    for entry in song_list:
        slug = entry.get("slug", "")
        if slug:
            filename = slug.strip("/").split("/")[-1] + ".json"
            expected_files[filename] = entry.get("title", "Unknown Title")


    if not os.path.exists(resolved_songs_dir):
        print(f"Error: Directory '{resolved_songs_dir}' does not exist.")
        return

    actual_files = set(
        f for f in os.listdir(resolved_songs_dir) if f.endswith(".json")
    )

    expected_set = set(expected_files.keys())


    missing_in_dir = expected_set - actual_files
    orphaned_in_dir = actual_files - expected_set
    matching_files = expected_set & actual_files


    corrupted_files = []
    for filename in matching_files:
        filepath = os.path.join(resolved_songs_dir, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                json.load(f)
        except Exception as e:
            corrupted_files.append((filename, str(e)))


    print("=" * 60)
    print("SONG LIST MATCH CHECK REPORT")
    print("=" * 60)
    print(f"Song List Path: {resolved_song_list_path}")
    print(f"Songs Directory: {resolved_songs_dir}")
    print("-" * 60)
    print(f"Total entries in song_list.json: {len(song_list)}")
    print(f"Total JSON files in '{resolved_songs_dir}': {len(actual_files)}")
    print("-" * 60)

    if missing_in_dir:
        print(f"❌ MISSING FILES ({len(missing_in_dir)} listed in song_list.json but missing from folder):")
        for file in sorted(missing_in_dir):
            print(f"  - {file}  (Title: {expected_files[file]})")
        print()

    if corrupted_files:
        print(f"❌ INVALID/CORRUPTED JSON FILES ({len(corrupted_files)}):")
        for file, err in corrupted_files:
            print(f"  - {file}: {err}")
        print()


    if orphaned_in_dir:
        print(f"⚠️  UNLISTED FILES ({len(orphaned_in_dir)} found in folder but not in song_list.json):")
        unlisted_entries = []

        for filename in orphaned_in_dir:
            print(f"  - {filename}")
            filepath = os.path.join(resolved_songs_dir, filename)

            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    song_data = json.load(f)
                    meta = song_data.get("meta", {})

                    slug_name = os.path.splitext(filename)[0]
                    entry = {
                        "title": meta.get("title", "N/A"),
                        "album": meta.get("album", "N/A"),
                        "releaseDate": meta.get("releaseDate", "N/A"),
                        "coverUrl": meta.get("coverUrl", "/assets/cover_images/default.png"),
                        "slug": f"/songs/{slug_name}"
                    }
                    unlisted_entries.append(entry)
            except Exception as e:
                print(f"    ⚠️ Could not read metadata from {filename}: {e}")


        unlisted_entries.sort(key=lambda x: (x["album"].lower(), x["title"].lower()))


        os.makedirs(os.path.dirname(resolved_output_path), exist_ok=True)

        with open(resolved_output_path, "w", encoding="utf-8") as f:
            json.dump(unlisted_entries, f, ensure_ascii=False, indent=2)

        print(f"\n✨ Generated '{resolved_output_path}' with {len(unlisted_entries)} entry(ies) sorted by album.")
    else:
        print("⚠️ No unlisted files found. Skipping unlisted_songs.json generation.")

    if not missing_in_dir and not orphaned_in_dir and not corrupted_files:
        print("✅ SUCCESS: All songs in song_list.json match the files in docs/data/songs!")


if __name__ == "__main__":
    check_and_generate_unlisted()