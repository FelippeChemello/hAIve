import modal

def download_whisperx():
    import subprocess
    subprocess.run(["git", "clone", "https://github.com/m-bain/whisperX.git"])
    subprocess.run(["pip", "install", "-e", "./whisperX"])

imageApp = (
    modal.Image.debian_slim()
    .apt_install("git", "ffmpeg", "libsndfile1")
    .pip_install(
        "yt-dlp",
        "pydub",
        "torch",
        "git+https://github.com/m-bain/whisperX.git"
    )
    .run_function(download_whisperx)
)
