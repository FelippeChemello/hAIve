import os
import boto3
import uuid

def upload_audio(audio_filename):
    print('Uploading files to R2')
    s3 = boto3.client(
        service_name='s3',
        endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
        aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
        region_name='auto'
    )

    audio_url = f"{os.getenv('R2_PUBLIC_URL')}/{audio_filename}"

    try: 
        if s3.head_object(Bucket=os.getenv('R2_BUCKET'), Key=f'{audio_filename}'):
            print(f"Audio file already exists on R2 at {audio_url}")
            return audio_url
    except:
        pass

    print(f"Uploading audio")
    s3.upload_file(audio_filename, os.getenv('R2_BUCKET'), f'{audio_filename}')

    print(f"Audio uploaded to R2 at {audio_url}")

    return audio_url