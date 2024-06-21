import ffmpeg

def separate_audio(video_filename, dir_name):
    try:
        with open(dir_name + "/audio.mp3", "r") as f:
            print('Audio file already exists')
            return dir_name + "/audio.mp3"
    except FileNotFoundError:
        pass

    print('Generating MP3 audio from video ' + video_filename)
    (
        ffmpeg
        .input(video_filename)
        .output(dir_name + "/audio.mp3", acodec='libmp3lame', ar=44100, ac=2, ab='192k')
        .run()
    )
    print('Audio extraction complete')

    return dir_name + "/audio.mp3"
