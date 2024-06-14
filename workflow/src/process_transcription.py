import os
import google.generativeai as gemini
import json

def process_transcription(transcription, dir_name, manual_ai):
    try :
        with open(dir_name + "/moments.json", "r") as f:
            print('Moments file already exists')
            return json.loads(f.read())
    except FileNotFoundError:
        pass

    system_instruction = "You must act as a Topic Extractor tool, It will be provided to you an SRT file, you should extract from it the most engaging moments. The transcription is from a Podcast, in which the host and guest discussed many topics.\n\nGUIDELINES FOR EXTRACTING TOPICS:\n- Duration: Must be between 3 and 10 minutes\n- Content Exclusions: Avoid including any promotional content, sponsorships, introductions, or conclusions.\n- Output Format: Must be a JSON array like with the following keys: \"start\" and \"end\" with the respective timestamps. \"title\" with a captivating YouTube video title in Portuguese that relates to the content of the moment but does not mention the podcast's name. \"description\" with a short description about what is talked on that moment. \"keywords\" as an array of 5 words related to the topic. \"extracted_sentence\" A single, impactful sentence extracted from the moment that encapsulates the essence of the discussion.\n\nFocus on extracting content that is particularly striking or memorable to ensure the highlights are engaging for the audience."

    if manual_ai:
        print("#######################################")
        print("Manual AI is enabled")
        print(f"Stopping the process, you should create the moments.json file manually at {dir_name}/moments.json")
        print("#######################################")
        print("SYSTEM INSTRUCTION:")
        print(system_instruction)
        print("MESSAGE:")
        print(transcription)
        return

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
        system_instruction=system_instruction
    )

    chat_session = genai.start_chat(history=[])

    print("Sending transcription to Gemini AI")

    response = chat_session.send_message(transcription)

    print("Response received from Gemini AI")
    print(response.text)

    json_response = json.loads(response.text)

    with open(dir_name + "/moments.json", "w") as f:
        f.write(json.dumps(json_response, indent=4))
                     
    return json_response



