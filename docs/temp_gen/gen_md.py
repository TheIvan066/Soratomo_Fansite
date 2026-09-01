import json
import os


def create_md_files(input_filename):
    # 1. Load the song list
    try:
        with open(input_filename, 'r', encoding='utf-8') as f:
            songs = json.load(f)
    except FileNotFoundError:
        print(f"Error: {input_filename} not found in this directory.")
        return

    # 2. Create an output directory for the md files
    output_dir = "output_md"
    os.makedirs(output_dir, exist_ok=True)

    # 3. Process each song
    for song in songs:
        slug = song.get('slug', '')

        # Extract "XXX" from "/songs/XXX"
        xxx = slug.split('/')[-1]

        if not xxx:
            continue

        # Define the content
        content = f'<div id="song-app-root" data-source="/data/songs/{xxx}.json"></div>'

        # Write the .md file
        output_path = os.path.join(output_dir, f"{xxx}.md")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Created: {output_path}")


if __name__ == "__main__":
    create_md_files('C:/Sorasite/docs/temp_gen/song_list.json')