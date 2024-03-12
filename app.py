from openai import OpenAI, OpenAIError
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
from tempfile import NamedTemporaryFile



load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__)
CORS(app)


# Calling text to text model with openai
@app.route('/get_response', methods=['POST'])
def get_openai_response():
    message = request.json.get('message', '')

    if not message:
        return jsonify({'error': "Message is required."}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": message}
            ]
        )
        chat_response = response.choices[0].message.content
        return jsonify({'response': chat_response})  
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Calling transcribe method with openai-whisper
@app.route('/whisper', methods=['POST'])
def handle_voice_and_get_response():
    results = []
    for filename, handle in request.files.items():
            temp = NamedTemporaryFile(suffix=".wav",delete=False)
            handle.save(temp)
            
            with open(temp.name, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                transcript = transcription.text 
                openai_response = get_openai_text_response(transcript)
                
                results.append({
                    'filename': filename,
                    'transcript': transcript,
                    'openai_response': openai_response
                })
    return results

# Calling text to text model for getting response from openai-whisper model
def get_openai_text_response(message): 
    if not message:
        return {'error': "Message is required."}

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": message}
            ]
        )
        chat_response = response.choices[0].message.content
        return {'response': chat_response}
    
    except Exception as e:
        return {'error': str(e)}


if __name__ == '__main__':
    app.run(debug=True)
