import click
from dotenv import load_dotenv

from src.download_video import download_video
from src.separate_audio import separate_audio
from src.upload_files import upload_files
from src.transcribe import transcribe
from src.process_transcription import process_transcription
from src.cut_video import cut_video
from src.upload_video import upload_video
from src.generate_thumbnail import generate_thumbnail
from src.color_palette import get_random_color

load_dotenv()

@click.command()
@click.option('--url', help='URL of the video to download')
def main(url):
    video_filename = download_video(url)

    audio_filename = separate_audio(video_filename)

    audio_url = upload_files(video_filename, audio_filename)

    transcription = transcribe(audio_url)

    moments = process_transcription(transcription)

    color = get_random_color()

    for moment in moments:
        print(f"Processing moment: {moment['title']}")
        print(f"\t{moment['start']} - {moment['end']}")
        print(f"\tKeywords: {', '.join(moment['keywords'])}")
        print(f"\tExtracted sentence: {moment['extracted_sentence']}\n")
    
        moment_filename = moment['title'].replace(' ', '_').replace('/', '_').replace(':', '_')

        output_video_filename = cut_video(video_filename, moment['start'], moment['end'], moment_filename + ".mp4")
        thumbnail_filename = generate_thumbnail(output_video_filename, moment['extracted_sentence'], moment_filename + ".png", color)

        upload_video(output_video_filename, moment['title'], moment['keywords'], url, thumbnail_filename)

    

if __name__ == '__main__':
    main()
