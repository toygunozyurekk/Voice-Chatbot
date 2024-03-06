import React, { useState } from 'react';
import axios from 'axios';

function OpenAIForm() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await axios.post('http://127.0.0.1:5000/get_response', { message });
      setResponse(res.data.response);
    } catch (error) {
      console.error("Error fetching response: ", error.response.data);
      setResponse(error.response.data.error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Message:
          <input type="text" value={message} onChange={handleMessageChange} />
        </label>
        <button type="submit">Send</button>
      </form>
      {response && <p>Response: {response}</p>}
    </div>
  );
}

export default OpenAIForm;
