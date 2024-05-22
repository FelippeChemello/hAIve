import logging
import sys
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

@app.function(gpu='any', timeout=600)
def transcribe(url, language=None):
    logger.info(f"Downloading audio from {url}")
    audio_path = download_audio(url)
    logger.info(f"Downloaded audio to {audio_path}")

    logger.info(f"Starting Transcription processing")
    import whisperx

    whisper_model = whisperx.load_model(pretained_whisper_model, device="cuda", compute_type="float16", language=language)
    audio = whisperx.load_audio(audio_path)

    logger.info("Transcribing audio")

    result = whisper_model.transcribe(audio)

    for segment in result["segments"]:
        logger.info(f"{segment['start']} - {segment['end']}: {segment['text']}")

    logger.info("Transcription completed")

    return result["segments"]

@app.function()
@web_app.post("/transcribe")
async def create_transcription_job(request: fastapi.Request):
    data = await request.json()
    url = data["url"]
    language = data.get("language", None)

    print(f"Transcribing {url} with language {language}")

    job_id = transcribe.spawn(url, language)

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