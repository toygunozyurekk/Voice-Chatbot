import React, { useState } from 'react';
import axios from 'axios';
import { ReactMic } from 'react-mic';

const AudioTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const onStop = (recordedBlob) => {
    setAudioBlob(recordedBlob.blob);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!audioBlob) {
      alert('Please record an audio first.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
  
    try {
      console.log(formData)
      const response = await axios.post('http://127.0.0.1:5000/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Specify content type
          'Accept': 'application/json', // Specify accepted response type
        }
      });
      console.log(response,"response")
      setTranscription(response.data.transcription);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };
  
  return (
    <div>
      <h2>Audio Transcription</h2>
      <div>
        <ReactMic
          record={isRecording}
          className="sound-wave"
          onStop={onStop}
          strokeColor="#000000"
          backgroundColor="#FF4081"
        />
        <button onClick={handleStartRecording} type="button" disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={handleStopRecording} type="button" disabled={!isRecording}>
          Stop Recording
        </button>
      </div>
      <div>
        {audioBlob && (
          <div>
            <audio controls>
              <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <button type="submit" disabled={!audioBlob}>
            Transcribe
          </button>
        </form>
      </div>
      {transcription && (
        <div>
          <h3>Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default AudioTranscription;
