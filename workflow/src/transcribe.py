import os
import requests
import time
import json
from typing import TypedDict, List

class Word(TypedDict):
    word: str
    start: float
    end: float
    score: float

class TranscriptionSegment(TypedDict):
    start: float
    end: float
    text: str
    words: List[Word]

def transcribe(audio_url, dir_name):
    try: 
        with open(dir_name + "/transcription.txt", "r") as f:
            print('Transcription file already exists')
            transcription_text = f.read()
        with open(dir_name + "/transcription.json", "r") as f:
            transcription: List[TranscriptionSegment] = json.load(f)

        return transcription_text, transcription
    except FileNotFoundError:
        pass

    print('Transcribing audio')
    response = requests.post(
        f"{os.getenv('MODAL_TRANSCRIBE_URL')}/transcribe",
        json={'url': audio_url, 'language': 'pt'}
    )

    job_id = response.json().get('job_id')
    print(f'Started transcription job {job_id}')

    while True:
        response = requests.get(f"{os.getenv('MODAL_TRANSCRIBE_URL')}/result/{job_id}")
        if response.status_code == 202:
            print('Waiting for transcription to complete...')
            time.sleep(10)
        else:
            break

    transcription: List[TranscriptionSegment] = response.json()
    print(f'Transcription complete')

    with open(dir_name + '/transcription.json', 'w') as f:
        f.write(json.dumps(transcription))

    transcription_text = ""
    for item in transcription:
        transcription_text += f"{item['start']} - {item['end']}: {item['text']}\n"
    
    with open(dir_name + '/transcription.txt', 'w') as f:
        f.write(transcription_text)
    print('Transcription saved to transcription.txt')

    return transcription_text, transcription