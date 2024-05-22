import whisperx
import gc
import torch

def transcribe_with_whisperx(audio_path):
    device = "cuda"
    batch_size = 16
    compute_type = "float16"

    model = whisperx.load_model("large-v2", device, compute_type=compute_type)
    audio = whisperx.load_audio(audio_path)
    result = model.transcribe(audio, batch_size=batch_size)
    print(result["segments"])

    model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
    aligned_result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    transcript = ""
    for segment in aligned_result["segments"]:
        print(f"{segment['start']} - {segment['end']}: {segment['text']}")
        transcript += f"{segment['start']} - {segment['end']}: {segment['text']}\n"

    gc.collect()
    if device == "cuda":
        torch.cuda.empty_cache()
        del model
        del model_a

    return transcript


if __name__ == "__main__":
    audio_path = input("Enter path to audio file: ")
    transcribe_with_whisperx(audio_path)
