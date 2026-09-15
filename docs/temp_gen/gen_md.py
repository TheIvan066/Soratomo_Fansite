import json
import os


def create_md_files(input_filename):
    try:
        with open(input_filename, 'r', encoding='utf-8') as f:
            songs = json.load(f)
    except FileNotFoundError:
        print(f"Error: {input_filename} not found in this directory.")
        return

    output_dir = "output_md"
    os.makedirs(output_dir, exist_ok=True)

    for song in songs:
        slug = song.get('slug', '')

        xxx = slug.split('/')[-1]

        if not xxx:
            continue

        content = f'<div id="song-app-root" data-source="/data/songs/{xxx}.json"></div>'

        output_path = os.path.join(output_dir, f"{xxx}.md")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Created: {output_path}")


if __name__ == "__main__":
    create_md_files('C:/Sorasite/docs/temp_gen/song_list.json')