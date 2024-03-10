import React, { useState } from 'react';
import axios from 'axios';
import { ReactMic } from 'react-mic';

const Chat = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
  
    const handleStartRecording = () => {
      setIsRecording(true);
    };
  
    const handleStopRecording = () => {
      setIsRecording(false);
    };
  
    const onStop = (recordedBlob) => {
      setAudioBlob(recordedBlob.blob);
      transcribeAudio(recordedBlob.blob);
    };
  
    const handleMessageChange = (event) => {
      setMessage(event.target.value);
    };
  
    const sendMessage = async () => {
      if (message.trim() === '' && !audioBlob) return;
      const msg = message.trim() !== '' ? message : 'Audio message...';
      setChatHistory([...chatHistory, { type: 'sent', content: msg }]);
      setMessage('');
  
      if (message.trim() !== '') {
        try {
          const res = await axios.post('http://127.0.0.1:5000/get_response', { message });
          setChatHistory([...chatHistory, { type: 'sent', content: msg }, { type: 'received', content: res.data.response }]);
        } catch (error) {
          console.error("Error fetching response: ", error.response.data);
        }
      }
    };
  
    const transcribeAudio = async (blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'recording.wav');
  
      try {
        const response = await axios.post('http://127.0.0.1:5000/whisper', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
        });
        const transcriptionResult = response.data.results.map(result => `${result.transcript}`).join('\n');
        setTranscription(transcriptionResult);
        setChatHistory([...chatHistory, { type: 'sent', content: 'Audio message...' }, { type: 'received', content: transcriptionResult }]);
      } catch (error) {
        console.error('Error transcribing audio:', error);
      }
    };
  return (
    <div style={{ maxWidth: 1000, margin: 'auto', backgroundColor: '#ECE5DD', padding: 20, borderRadius: 10, minHeight: 500 }}>
        <div style={{ marginTop: 20 }}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.type === 'sent' ? 'right' : 'left', margin: 10 }}>
            <span style={{
              maxWidth: '70%',
              padding: '8px 12px',
              backgroundColor: msg.type === 'sent' ? '#000' : 'blue',
              color: 'white',
              borderRadius: 20,
              wordWrap: 'break-word', 
              marginBottom: 20,
              fontSize:13
            }}>              
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div>
        <ReactMic
          record={isRecording}
          className="sound-wave"
          onStop={onStop}
          strokeColor="#000000"
          backgroundColor="#fff"
          width="400"
        /> 
        <div>
        <button onClick={handleStartRecording} type="button" disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={handleStopRecording} type="button" disabled={!isRecording}>
          Stop Recording
        </button>
        </div>
        <div>
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type a message"
            style={{ width: 'calc(100% - 60px)', padding: 10, marginRight: 10 }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
