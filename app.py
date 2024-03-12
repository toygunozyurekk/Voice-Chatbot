from openai import OpenAI, OpenAIError
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
import whisper
from tempfile import NamedTemporaryFile
from langchain_community.document_loaders import UnstructuredPDFLoader, OnlinePDFLoader, PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.vectorstores import Pinecone
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.chat_models import ChatOpenAI
from langchain.chains.question_answering import load_qa_chain


load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__)
CORS(app)

# Calling transcribe method with whisper library(If you want to use that it's just gonna transcribe to voice :) ) 
@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    model=whisper.load_model("base")
    if not request.files:
        return jsonify({'error': "Audio file is required."}), 400

    results = []

    for filename, handle in request.files.items():
        temp = NamedTemporaryFile()
        handle.save(temp)
        result = model.transcribe(temp.name)
        results.append({
            'filename': filename,
            'transcript': result['text'],
        })
    return {'results': results}

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





@app.route('/askapdf', methods=['POST'])
def handle_pdf_and_askapdf():
    messages = []

    for file_name, file in request.files.items():
        with NamedTemporaryFile(suffix=".pdf", delete=False) as temp:
            file.save(temp)
            temp_path = temp.name  # Save the temp file path to use in PyPDFLoader

        
            # Assuming PyPDFLoader takes a file path and loads or processes the PDF file
            loader = PyPDFLoader(file_path=temp_path)
            data = loader.load()  # Load or process the PDF file
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_documents(data)
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    vectorstore = Chroma.from_documents(texts, embeddings)
    query = request.json.get('message', '')
    docs = vectorstore.similarity_search(query)
    llm = ChatOpenAI(temperature=0, openai_api_key=OPENAI_API_KEY)
    chain = load_qa_chain(llm, chain_type="stuff")
    query = request.json.get('message', '')
    docs = vectorstore.similarity_search(query)
    result = chain.run(input_documents=docs, question=query)
    messages.append(result)
    return messages

if __name__ == '__main__':
    app.run(debug=True)
