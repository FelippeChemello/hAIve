from pydub import AudioSegment
import os

def extract_audio(video_path):
    audio_path = os.path.splitext(video_path)[0] + ".mp3"
    video = AudioSegment.from_file(video_path)
    video.export(audio_path, format="mp3")
    print(f"Extracted audio to {audio_path}")
    return audio_path

if __name__ == "__main__":
    video_path = input("Enter path to video file: ")
    extract_audio(video_path)
