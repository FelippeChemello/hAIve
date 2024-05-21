import whisperx

def transcribe_with_whisperx(audio_path):
    model = whisperx.load_model("base")
    result = model.transcribe(audio_path)
    aligned_result = whisperx.align(result["segments"], model)
    for segment in aligned_result:
        print(f"{segment['start']} - {segment['end']}: {segment['text']}")
    return aligned_result

if __name__ == "__main__":
    audio_path = input("Enter path to audio file: ")
    transcribe_with_whisperx(audio_path)
