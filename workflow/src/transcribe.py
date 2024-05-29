import os
import requests
import time

def transcribe(audio_url):
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

    transcription = response.json()
    print(f'Transcription complete')

    transcription_text = ""
    for item in transcription:
        transcription_text += f"{item['start']} - {item['end']}: {item['text']}\n"
    
    with open('transcription.txt', 'w') as f:
        f.write(transcription_text)
    print('Transcription saved to transcription.txt')

    return transcription_text