from src.download_video import download_video
from src.extract_audio import extract_audio
from src.transcribe_whisperx import transcribe_with_whisperx
import logging
import sys
from modal import web_endpoint
from src.stub import stub

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@stub.function()
def process_video(url):
    logger.info("Starting video processing")
    video_path = download_video(url)

    logger.info(f"Starting Audio processing")
    audio_path = extract_audio(video_path)

    logger.info(f"Starting Transcription processing")
    transcript = transcribe_with_whisperx(audio_path)

    logger.info("Transcription completed")

    return transcript

@stub.function()
@web_endpoint(method="POST", path="/process-video")
def process_video_endpoint(request):
    data = request.json()
    url = data.get('url')
    try:
        logger.info(f"Received URL: {url}")
        transcript = process_video.call(url)

        return {"transcript": transcript}, 200
    except Exception as e:
        logger.error(f"Error processing video: {e}")

        return {"error": str(e)}, 500

@stub.local_entrypoint()
def main():
    if len(sys.argv) > 1:
        url = sys.argv[1]
        transcript = process_video.call(url)

        with open("transcript.txt", "w") as f:
            f.write(transcript)
        print("Transcription completed and saved to transcript.txt")
