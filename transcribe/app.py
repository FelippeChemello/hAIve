from modal import App, Volume, Image
import fastapi

pretained_whisper_model = "/models/whisper"

def download_whisper_model():
    print("[DOWNLOAD_WHISPER_MODEL] Downloading model...")

    from faster_whisper import download_model

    download_model("large-v3", pretained_whisper_model)

    print("[DOWNLOAD_WHISPER_MODEL] Model downloaded.")  

imageApp = (
    Image.debian_slim()
    .apt_install("git", "ffmpeg", "libsndfile1")
    .pip_install(
        "faster-whisper",
        "transformers",
        "torch",
        "torchaudio",
        "git+https://github.com/m-bain/whisperx.git",
        "requests",
    )
    .run_function(download_whisper_model)
)

app = App("speech-to-text", image=imageApp)
web_app = fastapi.FastAPI()


