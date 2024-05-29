import os
import boto3
import uuid

def upload_files(video_filename, audio_filename):
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

    audio_url = f"{os.getenv('R2_PUBLIC_URL')}/{dir_name}/audio.mp3"

    return audio_url