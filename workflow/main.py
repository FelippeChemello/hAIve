import click
import uuid
import os
import re
from dotenv import load_dotenv

from src.download_video import download_video
from src.separate_audio import separate_audio
from src.upload_audio import upload_audio
from src.transcribe import transcribe
from src.process_transcription import process_transcription
from src.cut_video import cut_video
from src.upload_youtube_video import upload_youtube_video
from src.generate_thumbnail import generate_thumbnail
from src.color_palette import get_random_color
from src.burn_subtitles import burn_subtitles

load_dotenv()

@click.command()
@click.option('--url', help='URL of the video to download')
@click.option('--orientation', help='Orientation of the video', default='landscape', type=click.Choice(['landscape', 'portrait']))
@click.option('--manual-ai', help='Stop workflow for manual AI (gemini) processing', is_flag=True)
def main(url, orientation, manual_ai):
    dir_name = f"tmp/{str(uuid.uuid3(uuid.NAMESPACE_URL, url))}"
    os.makedirs(dir_name, exist_ok=True)

    video_filename = download_video(url, dir_name)

    audio_filename = separate_audio(video_filename, dir_name)

    audio_url = upload_audio(audio_filename)

    transcription_text, transcription_json = transcribe(audio_url, dir_name)

    moments = process_transcription(transcription_text, dir_name, manual_ai, orientation)

    color = get_random_color(dir_name)

    for moment in moments:
        print(f"Processing moment: {moment['title']}")
        print(f"\t{moment['start']} - {moment['end']}")
        print(f"\tKeywords: {', '.join(moment['keywords'])}")
        print(f"\tExtracted sentence: {moment['extracted_sentence']}\n")
        print(f"\tDescription: {moment['description']}\n")
    
        parsed_title = re.sub(r'[^\w\s]', '', moment['title'])
        moment_filename = f"{dir_name}/{parsed_title}"
        
        try:
            cutted_video_filename, duration, speed = cut_video(
                video_filename=video_filename, 
                start=moment['start'], 
                end=moment['end'], 
                output_filename=moment_filename + ".mp4", 
                orientation=orientation
            )
            subtitled_video_filename = burn_subtitles(
                video_filename=cutted_video_filename, 
                moment_filename=moment_filename, 
                raw_transcription=transcription_json, 
                start=float(moment['start']), 
                end=float(moment['end']), 
                speed=speed,
                orientation=orientation
            )

            if orientation == 'landscape':
                thumbnail_filename = generate_thumbnail(
                    video_filename=subtitled_video_filename, 
                    text=moment['extracted_sentence'], 
                    thumbnail_filename=moment_filename + ".png", 
                    color=color
                )

            if orientation == 'landscape' or duration < 60:
                upload_youtube_video(
                    video_filename=subtitled_video_filename, 
                    title=moment['title'], 
                    keywords=moment['keywords'], 
                    original_video_url=url, 
                    thumbnail_filename=thumbnail_filename if orientation == 'landscape' else None, 
                    description=moment['description']
                )
        except Exception as e:
            print("##########################################")
            print(f"Error processing moment {moment['title']}")
            print(e)
            print("##########################################")


if __name__ == '__main__':
    main()
