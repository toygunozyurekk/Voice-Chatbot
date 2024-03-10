# Audio Message Transcription and Response Generation Project

## Introduction

This project offers a comprehensive solution for transcribing audio messages and generating responses, leveraging OpenAI's Whisper and GPT-4 models. Integrated into a Flask backend with a React frontend, the application allows users to record audio messages via a web interface, transcribes these messages into text, and employs the GPT-4 model to craft responses to the transcribed text. This README contains all you need to know to get started, including setup instructions, usage tips, and how to contribute.

## Installation

### Prerequisites

- Python 3.8 or newer
- Node.js and npm
- Flask
- React
- Axios
- Whisper model from OpenAI (for the backend)
- dotenv (for environment variable management)
- Flask-CORS (for handling cross-origin requests)

### Backend Setup

1. Clone the repository to your local machine.
2. Navigate to the project directory and install the Python dependencies:

    ```bash
    pip install -r requirements.txt
    ```

3. Create a `.env` file in the root of the backend project directory and add your OpenAI API key:

    ```env
    OPENAI_API_KEY=your_api_key_here
    ```

4. Start the Flask server:

    ```bash
    flask run
    ```

### Frontend Setup

1. Navigate to the frontend project directory (assuming it's separate from the backend).
2. Install the required npm packages:

    ```bash
    npm install
    ```

3. Start the React development server:

    ```bash
    npm start
    ```

## Usage

Once both the frontend and backend servers are running, navigate to the URL provided by the React development server (typically `http://localhost:3000`) in your web browser.

- To send a text message: Type your message in the text box and click the "Send" button.
- To send an audio message: Click the "Start Recording" button to start recording your message and the "Stop Recording" button once you are done. The application will automatically transcribe your audio message and display the transcription along with a generated response.
