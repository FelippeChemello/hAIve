import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def upload_youtube_video(video_filename, title, keywords, original_video_url, thumbnail_filename, description):
    print("Uploading video to YouTube")

    youtube = build('youtube', 'v3', credentials=Credentials(
        None,
        refresh_token=os.getenv('GOOGLE_REFRESH_TOKEN'),
        token_uri='https://accounts.google.com/o/oauth2/token',
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    ))

    media_body = {
        "snippet": {
            "categoryId": "24",
            "description": description + "\n\n" + "Video Original: " + original_video_url,
            "title": title,
            "tags": keywords
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False
        },
    }

    request = youtube.videos().insert(
        part="snippet,status",
        body=media_body,
        media_body=MediaFileUpload(video_filename, resumable=True)
    )

    response = request.execute()

    if thumbnail_filename:
        request = youtube.thumbnails().set(
            videoId=response['id'],
            media_body=MediaFileUpload(thumbnail_filename, resumable=True)
        )

        request.execute()

    print(f"Video uploaded: https://www.youtube.com/watch?v={response['id']}")

