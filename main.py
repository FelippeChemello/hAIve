import yt_dlp as youtube_dl
from pydub import AudioSegment
import os
import whisperx
import gc


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


def extract_audio(video_path):
    audio_path = os.path.splitext(video_path)[0] + ".mp3"
    video = AudioSegment.from_file(video_path)
    video.export(audio_path, format="mp3")
    print(f"Extracted audio to {audio_path}")
    return audio_path


def transcribe_with_whisperx(audio_path):
    device = "cpu"  # Use "cuda" for GPU if available
    batch_size = 16
    compute_type = "float32"  # Use float32 for better compatibility

    # 1. Transcribe with original Whisper (batched)
    model = whisperx.load_model("base", device, compute_type=compute_type)
    audio = whisperx.load_audio(audio_path)
    result = model.transcribe(audio, batch_size=batch_size)
    print(result["segments"])  # before alignment

    # 2. Align Whisper output
    model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
    aligned_result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    transcript = ""
    for segment in aligned_result["segments"]:
        print(f"{segment['start']} - {segment['end']}: {segment['text']}")
        transcript += f"{segment['start']} - {segment['end']}: {segment['text']}\n"

    # Clean up models from memory
    gc.collect()
    if device == "cuda":
        import torch
        torch.cuda.empty_cache()
        del model
        del model_a

    return transcript


def main(url):
    video_path = download_video(url)
    audio_path = extract_audio(video_path)
    transcript = transcribe_with_whisperx(audio_path)
    with open("transcript.txt", "w") as f:
        f.write(transcript)
    print("Transcription completed and saved to transcript.txt")


if __name__ == "__main__":
    url = input("Enter YouTube video URL: ")
    main(url)
