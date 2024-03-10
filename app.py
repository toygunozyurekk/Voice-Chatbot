from openai import OpenAI, OpenAIError
from flask import Flask, request, jsonify, send_from_directory,abort
from dotenv import load_dotenv
import os
from flask_cors import CORS
import whisper
from werkzeug.utils import secure_filename
import ssl
from tempfile import NamedTemporaryFile
import openai

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__)
CORS(app)

model=whisper.load_model("base")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if not request.files:
        return jsonify({'error': "Audio file is required."}), 400


    # For each file, let's store the results in a list of dictionaries.
    results = []

    # Loop over every file that the user submitted.
    for filename, handle in request.files.items():
        # Create a temporary file.
        # The location of the temporary file is available in `temp.name`.
        temp = NamedTemporaryFile()
        # Write the user's uploaded file to the temporary file.
        # The file will get deleted when it drops out of scope.
        handle.save(temp)
        # Let's get the transcript of the temporary file.
        result = model.transcribe(temp.name)
        # Now we can store the result object for this file.
        results.append({
            'filename': filename,
            'transcript': result['text'],
        })

    # This will be automatically converted to JSON.
    return {'results': results}



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


@app.route('/whisper', methods=['POST'])
def handler():
    results = []
    for filename, handle in request.files.items():
            temp = NamedTemporaryFile(suffix=".wav",delete=False)
            handle.save(temp)
            with open(temp.name, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                # Append both filename and transcription to the results
                results.append({
                    'filename': filename,
                    'transcript': transcription.text # Adjust according to the actual API response structure
                })
    return results


if __name__ == '__main__':
    app.run(debug=True)
