import yt_dlp

def download_video(url):
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

    return 'video.mp4'