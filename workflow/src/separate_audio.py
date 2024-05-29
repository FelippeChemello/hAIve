from ffmpeg import FFmpeg

def separate_audio(video_filename):
    print('Generating MP3 audio from video')
    FFmpeg().input(video_filename).output('audio.mp3').execute()
    print('Audio extraction complete')

    return 'audio.mp3'