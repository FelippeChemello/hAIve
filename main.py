from download_video import download_video
from extract_audio import extract_audio
from transcribe_whisperx import transcribe_with_whisperx
import modal

stub = modal.Stub("youtube-media-toolkit")

@stub.function()
def process_video(url):
    video_path = download_video(url)
    audio_path = extract_audio(video_path)
    transcript = transcribe_with_whisperx(audio_path)
    return transcript



@stub.local_entrypoint()
def main():
    url = input("Enter YouTube video URL: ")
    transcript = process_video.call(url)
    with open("transcript.txt", "w") as f:
        f.write(transcript)
    print("Transcription completed and saved to transcript.txt")
