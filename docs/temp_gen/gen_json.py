import json
import os


def create_song_files(input_filename):
    # 1. Load the song list
    try:
        with open(input_filename, 'r', encoding='utf-8') as f:
            songs = json.load(f)
    except FileNotFoundError:
        print(f"Error: {input_filename} not found.")
        return

    # Create an output_json directory to keep things organized
    output_dir = "../data/output_json"
    os.makedirs(output_dir, exist_ok=True)

    for song in songs:
        # Extract the slug for the filename (e.g., /songs/EEE -> EEE)
        slug_raw = song.get('slug', 'unknown')
        filename = slug_raw.split('/')[-1] if '/' in slug_raw else slug_raw

        # Process coverUrl (e.g., /assets/cover_images/DDD.png -> cover_images/DDD)
        raw_cover = song.get('coverUrl', '')
        processed_cover = raw_cover.replace('/assets/', '').rsplit('.', 1)[0]

        # 2. Construct the JSON structure
        # Note: Since your input JSON doesn't contain lyrics/chords,
        # these are set to your provided template defaults.
        data = {
            "meta": {
                "title": song.get('title'),
                "artist": "ときのそら",
                "originalKey": "Em",
                "capo": "",
                "description": "",
                "composer": "ナユタン星人",
                "lyricist": "ナユタン星人",
                "album": song.get('album'),
                "releaseDate": song.get('releaseDate'),
                "coverUrl": processed_cover,
                "penlight_color": ["#ff0000"],
                "links": [
                    {"name": "Official MV", "url": "https://youtu.be/VCsWgOMu4_8?si=6LcEEJ27lZR_-xuC"}
                ]
            },
            "chords": [
                {
                    "section": "Intro",
                    "lines": [
                        {"c": "X", "t": "----|"},
                        {"c": "E5  G5  A5  B5  A5  G5  E5  D5  E5  G5  E5  D5  E5",
                         "t": "=  =  =  =  =  =  =  = | =  =  =  =  ====|"},
                    ]
                }
            ],
            "calls": [
                {"lyrics": "我らの宇宙のはじまりは", "call": ""}
            ],
            "lyrics": [
                {
                    "ja": "明け方の一番星は",
                    "romaji": "Akegata no Ichibanboshi ha",
                    "en": "and the morning star",
                    "zh": "晨曦最亮的星",
                    "notes": [
                        {"word": "一番星", "meaning": "The first star of the evening"}
                    ]
                }
            ]
        }

        # 3. Write the file
        output_path = os.path.join(output_dir, f"{filename}.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"Generated: {output_path}")


if __name__ == "__main__":
    create_song_files('song_list.json')