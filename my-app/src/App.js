
import './App.css';
import OpenAIForm from './chatbot';
import AudioTranscription from './AudioTranscription';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <OpenAIForm />
        <AudioTranscription />
      </header>
    </div>
  );
}

export default App;
