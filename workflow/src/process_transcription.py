import os
import google.generativeai as gemini
import json

def process_transcription(transcription):
    gemini.configure(api_key=os.getenv('GEMINI_API_KEY'))

    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",
    }
    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE",
        },
    ]

    genai = gemini.GenerativeModel(
        model_name="gemini-1.5-pro-latest",
        safety_settings=safety_settings,
        generation_config=generation_config,
        system_instruction="You must act as a Topic Extractor tool, It will be provided to you an SRT file, you should extract from it the most engaging moments. The transcription is from a Podcast, in which the host and guest discussed many topics.\nAnswer as an Array of JSON objects with keys \"start\" and \"end\" for the timestamp and key \"title\" with a engaging Youtube Video title in portuguese for the moment extracted, also provide key \"keywords\" with an array of words related to the moment, finally provide a key named \"extracted_sentence\" with the exactly text most shocking said by the speakers during this moment, this sentence must be short and shocking.\nIgnore all kind of promotions and sponsorship. Do not select this parts. Also do not select the intro and outro as a moment.\nEach moment should have between 3 and 10 minutes",
    )

    chat_session = genai.start_chat(history=[])

    print("Sending transcription to Gemini AI")

    response = chat_session.send_message(transcription)

    print("Response received from Gemini AI")
    print(response.text)

    parsed_response = json.loads(response.text)

    return parsed_response



