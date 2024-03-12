import React, { 
  useEffect, 
  useRef,
  useState 
} from "react";
import './App.css';
import {
    Button,
    Box,
    Container,
    Grid,
    IconButton,
    List,
    ListItem, 
    ListItemText,
    Paper,
    Typography,
    TextField, 
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { styled , keyframes } from '@mui/system';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicRecorder from 'mic-recorder-to-mp3';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MicIcon from '@mui/icons-material/Mic';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import axios from 'axios';


function App() {
  const bottomRef = useRef(null);
  const [message, setMessage] = useState("");
  const [audioFile, setAudioFile] = useState(null);

  const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

  const mockMessages = [
    {
      role: 'assistant',
      content: 'Hello! How can I help you today? 🫡',
      text: 'Hello! How can I help you today? 🫡 ' 
    },
  ];

  const [messages, setMessages] = useState(mockMessages);
  
  const UserMessage = styled('div', { shouldForwardProp: (prop) => prop !== 'audio' })`
  position: relative;
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.contrastText};
  padding: ${({ theme }) => theme.spacing(1, 2)};
  padding-right: ${({ theme, audio }) => (audio ? theme.spacing(6) : theme.spacing(2))};
  border-radius: 1rem;
  border-top-right-radius: 0;
  align-self: flex-end;
  max-width: 80%;
  word-wrap: break-word;
`;

const AgentMessage = styled('div')`
  position: relative;
  background-color: ${({ theme }) => theme.palette.grey[700]};
  color: ${({ theme }) => theme.palette.primary.contrastText};
  padding: ${({ theme }) => theme.spacing(1, 2)};
  border-radius: 1rem;
  border-top-left-radius: 0;
  align-self: flex-end;
  max-width: 80%;
  word-wrap: break-word;
`;

const MessageWrapper = styled('div')`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  justify-content: ${({ align }) => (align === 'user' ? 'flex-end' : 'flex-start')};
`;

const AudioControls = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [player, setPlayer] = useState(null);

  const startRecording = async () => {
    const newRecorder = new MicRecorder({ bitRate: 128 });

    try {
    await newRecorder.start();
    setIsRecording(true);
    setRecorder(newRecorder);
    } catch (e) {
    console.error(e);
    alert(e)
    }
};

  const stopRecording = async () => {
    if (!recorder) return;

    try {
    const [buffer, blob] = await recorder.stop().getMp3();
    const audioFile = new File(buffer, "voice-message.mp3", {
        type: blob.type,
        lastModified: Date.now(),
    });
    setPlayer(new Audio(URL.createObjectURL(audioFile)));
    setIsRecording(false);
    setAudioFile(audioFile);
    } catch (e) {
    console.error(e);
    alert(e)
    }
  };

  const playRecording = () => {
    if (player) {
    player.play();
    }
};
  return (
    <Container>
        <Box sx={{ width: "100%", mt: 4 }}>
            <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={12} md>
                    <IconButton
                    color="primary"
                    aria-label="start recording"
                    onClick={startRecording}
                    disabled={isRecording}
                    >
                    <MicIcon />
                    </IconButton>
                </Grid>
                <Grid item xs={12} md>
                    <IconButton
                    color="secondary"
                    aria-label="stop recording"
                    onClick={stopRecording}
                    disabled={!isRecording}
                    >
                    <FiberManualRecordIcon />
                    </IconButton>
                </Grid>
                <Grid item xs="auto">
                    <Button
                    variant="contained"
                    disableElevation
                    onClick={playRecording}
                    disabled={isRecording}
                    >
                    Play Recording
                    </Button>
                </Grid>
                <SendButton audioFile={audioFile} />
            </Grid>
        </Box>
    </Container>
  )
}

const ChatMessages = ({messages}) => {
  const theme = useTheme();
  return(
    <Container>
        <Box sx={{ width: '100%', mt: 4, maxHeight: 300, minHeight: 300, overflow: 'auto' }}>
            <Paper elevation={0} sx={{ padding: 2 }}>
                <List>
                    {messages.map((message, index) => (
                    <ListItem key={index} sx={{ padding: 0 }}>
                        <ListItemText
                        sx={{ margin: 0 }}
                        primary={
                            <MessageWrapper align={message.role}>
                            {message.role === 'user' ? (
                                <>
                                <UserMessage theme={theme} audio={message.audio}>
                                    {message.text}
                                    {message.audio && ( 
                                    <IconButton
                                        size="small"
                                        sx={{ 
                                            position: 'absolute', 
                                            top: '50%', 
                                            right: 8, 
                                            transform: 'translateY(-50%)' 
                                            }}
                                        onClick={() => message.audio.play()}
                                    >
                                        <VolumeUpIcon fontSize="small" />
                                    </IconButton>
                                    )}
                                </UserMessage>
                                </>
                            ) : (
                                <AgentMessage theme={theme}>
                                    {message.text}
                                </AgentMessage>
                            )}
                            </MessageWrapper>
                        }
                        />
                    </ListItem>
                    ))}
                    <div ref={bottomRef} />
                </List>
            </Paper>
        </Box>
    </Container>
  );
}

const ThinkingBubbleStyled = styled(MoreHorizIcon)`
  animation: ${pulse} 1.2s ease-in-out infinite;
  margin-bottom: -5px;
`;

const ThinkingBubble = () => {
  const theme = useTheme();
  return <ThinkingBubbleStyled theme={theme} sx={{ marginBottom: '-5px' }} />;
};

const MessageInput = ({ message, setMessage, isAudioResponse, handleSendMessage }) => {
  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
      <TextField
        variant="outlined"
        fullWidth
        autoFocus
        label="Type your message"
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
      />
      <IconButton
        color="primary"
        onClick={() => handleSendMessage(isAudioResponse)}
        disabled={message.trim() === ""}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
  
}

const handleSendMessage = async () => {
  if (message.trim() !== "") {
    setMessages(prevMessages => {
      const messageObjects = prevMessages.map(msg => ({ role: msg.role, content: msg.content }));
      messageObjects.push({ role: "user", content: message });
      return [
        ...prevMessages,
        { role: "user", content: message, text: message, audio: null },
        { role: "assistant", content: <ThinkingBubble />, text: <ThinkingBubble />, key: "thinking" }
      ];
    });
    
    setMessage("");

    let messageObjects = messages.map(msg => ({ role: msg.role, content: msg.content }));
    messageObjects.push({ role: "user", content: message });

    try {
      const response = await axios.post("http://127.0.0.1:5000/get_response", {
        message: message
      });

      setMessages((prevMessages) => {
        const filteredMessages = prevMessages.filter((msg) => msg.key !== "thinking");
        return [...filteredMessages, { role: "assistant", content: response.data.response, text: response.data.response, audio: null }];
      });

    } catch (error) {
      console.error("Error sending text message:", error);
      alert("An error occurred while sending message.");
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.key !== "thinking"));
    }
  }
};

const scrollToBottom = () => {
  if (bottomRef.current) {
    if (typeof bottomRef.current.scrollIntoViewIfNeeded === 'function') {
      bottomRef.current.scrollIntoViewIfNeeded({ behavior: 'smooth' });
    } else {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

const uploadAudio = async () => {
    if (!audioFile) {
      console.log("No audio file to upload");
      return;
    }
  console.log("Uploading audio...");
  const formData = new FormData();
  formData.append("audio", audioFile); 

  setMessages((prevMessages) => [
    ...prevMessages,
    { role: "user", content: "🎤 Audio message", text: "🎤 Audio message", audio: audioFile }
  ]);
  
  try {
    console.log("Sending audio...");
    const response = await axios.post("http://127.0.0.1:5000/whisper", formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    }); 
    if (response.data && response.data[0] && response.data[0].openai_response) {
      const openaiResponse = response.data[0].openai_response;
      
      console.log("OpenAI Response:", openaiResponse);
      
      setMessages((prevMessages) => {
        const filteredMessages = prevMessages.filter((msg) => msg.key !== "thinking");
        return [
          ...filteredMessages, 
          { 
            role: "assistant", 
            content: openaiResponse.response, 
            text: openaiResponse.response, 
            audio: null
          }
        ];
      });
      
      console.log("Audio sent successfully!");
    } else {
      console.error("Unexpected response structure:", response.data);
      alert("Received unexpected response structure from the server.");
    }

  } catch (error) {
    console.error("Error sending audio:", error);
    alert("An error occurred while sending audio: " + error.message);
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.key !== "thinking"));
  }
};



const SendButton = ({audioFile}) => {
  const theme = useTheme();
  return (
    <Grid item xs="auto">
      <Button
        variant="contained"
        color="primary"
        disableElevation
        onClick={uploadAudio}
        disabled={!audioFile}
        startIcon={<CloudUploadIcon />}
      >
        Send Audio
      </Button>
    </Grid>
  );
}

function filterMessageObjects(list) {
  return list.map(({ role, content }) => ({ role, content }));
}

useEffect(() => {
  scrollToBottom();
}, [messages]);

  return (
    <Container maxWidth="sm" sx={{pt: 2}}>
      <Typography variant="h4" align="center" gutterBottom>
          Voice Chatbot
      </Typography>
      <ChatMessages messages={messages} />
      <AudioControls />
      <MessageInput 
        message={message}
        setMessage={setMessage}
        isAudioResponse={false}
        handleSendMessage={handleSendMessage}
      />
    </Container>
  );
}

export default App;