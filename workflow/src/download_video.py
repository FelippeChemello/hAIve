import yt_dlp

def download_video(url, dir_name):
    try: 
        with open(dir_name + '/video.mp4', 'r'):
            print('Video already downloaded')
            return dir_name + '/video.mp4'
    except FileNotFoundError:
        pass

    print(f'Downloading video from {url}')
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'merge_output_format': 'mp4',
        'outtmpl': dir_name + '/' + 'video.%(ext)s',
        'addmetadata': True
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    print('Download complete')

    return dir_name + '/video.mp4'