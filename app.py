from openai import OpenAI
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS

load_dotenv()
client = OpenAI()


app = Flask(__name__)
CORS(app)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


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




@app.route('/get_response', methods=["POST"])
def api_get_response():
    data = request.json
    message = data.get('message')
    if not message:
        return jsonify({"error": "No message provided"}), 400
    response_message = get_openai_response(message)
    return jsonify({"response": response_message})

if __name__ == '__main__':
    app.run(debug=True)
