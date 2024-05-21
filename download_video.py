import yt_dlp as youtube_dl

def download_video(url):
    ydl_opts = {
        'format': 'best',
        'outtmpl': '%(title)s.%(ext)s',
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=True)
        video_title = info_dict.get('title', None)
        video_ext = info_dict.get('ext', None)
        video_path = f"{video_title}.{video_ext}"
        print(f"Downloaded video to {video_path}")
        return video_path

if __name__ == "__main__":
    url = input("Enter YouTube video URL: ")
    download_video(url)
