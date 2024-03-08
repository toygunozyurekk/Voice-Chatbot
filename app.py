from openai import OpenAI
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
import os
from flask_cors import CORS
import whisper
from werkzeug.utils import secure_filename
import ssl

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__)
CORS(app)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio_file' not in request.files:
        return jsonify({'error': "Audio file is required."}), 400

    audio_file = request.files['audio_file']
    try:
        # Use OpenAI's Audio API for transcription
        response = client.audio.transcriptions.create(audio=audio_file.read(), model="whisper-1")
        transcription = response['text']
        return jsonify({'transcription': transcription})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/get_response', methods=['POST'])
def get_openai_response():
    data = request.json
    message = data.get('message', '')

    if not message:
        return jsonify({'error': "Message is required."}), 400

    try:
        # Using OpenAI's ChatCompletion to get a response
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": message}
            ]
        )
        
        # Accessing the response data correctly
        # Assuming the response object has a method or attribute to get the desired content
        chat_response = response.choices[0].message.content
        return jsonify({'response': chat_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500





if __name__ == '__main__':
    app.run(debug=True)
