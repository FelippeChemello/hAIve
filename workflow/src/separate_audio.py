import ffmpeg

def separate_audio(video_filename, dir_name):
    try:
        with open(dir_name + "/audio.mp3", "r") as f:
            print('Audio file already exists')
            return dir_name + "/audio.mp3"
    except FileNotFoundError:
        pass

    print('Generating MP3 audio from video')
    ffmpeg.input(video_filename).output(dir_name + "/audio.mp3").execute()
    print('Audio extraction complete')

    return dir_name + "/audio.mp3"