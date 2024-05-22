import os
import io
import click
import yt_dlp
import boto3
import uuid
import requests
import time
from ffmpeg import FFmpeg
from dotenv import load_dotenv

load_dotenv()

@click.command()
@click.option('--url', help='URL of the video to download')
def main(url):
    print(f'Downloading video from {url}')
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'merge_output_format': 'mp4',
        'outtmpl': 'video.%(ext)s',
        'addmetadata': True
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    print('Download complete')

    print('Generating MP3 audio from video')
    FFmpeg().input('video.mp4').output('audio.mp3').execute()
    print('Audio extraction complete')

    print('Uploading files to R2')
    s3 = boto3.client(
        service_name='s3',
        endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
        aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
        region_name='auto'
    )

    dir_name = str(uuid.uuid4())

    print(f"Uploading audio")
    s3.upload_file('audio.mp3', os.getenv('R2_BUCKET'), f'{dir_name}/audio.mp3')
    print(f"Uploading video")
    s3.upload_file('video.mp4', os.getenv('R2_BUCKET'), f'{dir_name}/video.mp4')
    print(f"Files uploaded to R2 at {os.getenv('R2_PUBLIC_URL')}/{dir_name}")

    print('Transcribing audio')
    audio_url = f"{os.getenv('R2_PUBLIC_URL')}/{dir_name}/audio.mp3"

    response = requests.post(
        f"{os.getenv('MODAL_TRANSCRIBE_URL')}/transcribe",
        json={'url': audio_url, 'language': 'pt'}
    )

    job_id = response.json().get('job_id')
    print(f'Started transcription job {job_id}')

    while True:
        response = requests.get(f"{os.getenv('MODAL_TRANSCRIBE_URL')}/result/{job_id}")
        if response.status_code == 202:
            print('Waiting for transcription to complete...')
            time.sleep(10)
        else:
            break

    transcription = response.json()
    print(f'Transcription complete')

    transcription_text = ""
    for item in transcription:
        transcription_text += f"{item['start']} - {item['end']}: {item['text']}\n"
    
    with open('transcription.txt', 'w') as f:
        f.write(transcription_text)

if __name__ == '__main__':
    main()
