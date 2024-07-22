import logging
import sys
import os
import fastapi
from modal.functions import FunctionCall
from modal import asgi_app
from app import app, pretained_whisper_model, web_app

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.function()
@asgi_app()
def fastapi_app():
    return web_app

def download_audio(url):
    import requests
    response = requests.get(url)
    if response.status_code == 200:
        audio_data = response.content
        with open("audio.mp3", "wb") as f:
            f.write(audio_data)
        return "audio.mp3"
    else:
        raise Exception("Failed to download audio")

@app.function(gpu='any', timeout=1200)
def transcribe(audio, language=None):
    logger.info(f"Starting Transcription processing")
    import whisperx

    whisper_model = whisperx.load_model(pretained_whisper_model, device="cuda", compute_type="float16", language=language)

    logger.info("Transcribing audio")

    result = whisper_model.transcribe(audio)

    logger.info("Transcription completed")

    alignment_model, metadata = whisperx.load_align_model(result["language"], device="cuda")
    result = whisperx.align(result["segments"], alignment_model, metadata, audio, "cuda", return_char_alignments=False)

    logger.info("Alignment completed")

    return result["segments"]

@app.function()
@web_app.post("/transcribe")
async def create_transcription_job(request: fastapi.Request):
    data = await request.json() if request.headers.get("content-type") == "application/json" else await request.form()
    
    url = data.get("url", None)
    audio_file = data.get("audio", None)
    language = data.get("language", None)

    if url:
        logger.info(f"Downloading audio from {url}")
        audio_file_path = download_audio(url)
        logger.info(f"Downloaded audio to {audio_file_path}")
    elif audio_file:
        audio_file_path = audio_file.filename
        with open(audio_file_path, "wb") as f:
            f.write(audio_file.file.read())
    else:
        raise Exception("No audio provided")
    

    print(f"Transcribing with language {language}")
    
    import whisperx
    audio = whisperx.load_audio(audio_file_path)

    job_id = transcribe.spawn(audio, language)

    return fastapi.responses.JSONResponse({"job_id": job_id.object_id})
    
    
@web_app.get("/result/{call_id}")
async def poll_results(call_id: str):
    function_call = FunctionCall.from_id(call_id)
    try:
        return function_call.get(timeout=0)
    except TimeoutError:
        http_accepted_code = 202
        return fastapi.responses.JSONResponse({}, status_code=http_accepted_code)

@app.local_entrypoint()
def local_main():
    url = "https://pub-29571f9f6cc34a1897b4b595a8caad75.r2.dev/ea87a6d0-17db-11ef-aa82-43d45adbe438/audio.mp3"
    job_id = transcribe.remote(url, 'pt')

    logger.info(f"Transcription job started with ID: {job_id}")