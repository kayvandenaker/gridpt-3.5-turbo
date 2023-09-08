import { useState, useEffect, useRef } from 'react';
import { BrowserSerial } from "browser-serial";
// import Speech from './Speech.jsx';
import 'regenerator-runtime/runtime'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

//TestTest
const systemMessage = { 
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}

function App() {
  const [connection, setConnection] = useState(false);
  const loader = useRef(null);
  const input = useRef(null);

  const serial = new BrowserSerial();

  const turnOn = () => { setConnection(true); };
  const turnOff = () => { setConnection(false); };

  const sendCommand = (msg) => {
    if (connection) {
      serial.write(msg)
        .then(() => {
          console.log(`Sent to serial: `, msg);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const randomCommand = () => {
    let binary = "";
    for(let i = 0; i < 64; ++i) {
      binary += Math.floor(Math.random() * Math.floor(2));
    }
    sendCommand(binary);
  }

  useEffect(() => {
    if (connection) {
      serial.connect()
        .then(() => {
          console.log('Connected to serial port');
          serial.write("0000000000000000000000000001100000011000000000000000000000000000")
        })
        .catch((error) => {
          console.error('Error connecting to serial port:', error);
        });
    } else {
      serial.disconnect()
        .then(() => {
          console.log('Disconnected from serial port');
        })
        .catch((error) => {
          console.error('Error disconnecting from serial port:', error);
        });
    }
  }, [connection]); 

  const handleSend = async (message) => {
    loader.current.className = "loader loading";
    sendCommand("00111100 01111110 01100110 00001100 00011000 00000000 00011000 00011000");
    console.log("Fetching data for: ", message);

    // message = "Draw a " + message + " in a 8x8 bitmap grid formatted as a plain text inside a code snipper. output only the code snippet with no comments and only containing the bitmap, where 1 is on and 0 is off. your answer should look like this, just swap the 0s and 1s for the shape you drew: ```let bitmap = [[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 1, 1, 1, 1, 0, 0],[0, 0, 1, 0, 0, 1, 0, 0],[0, 0, 1, 0, 0, 1, 0, 0],[0, 0, 1, 1, 1, 1, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0]];```"; 
    message = "Draw a " + message + " in a 8x8 bitmap grid formatted as a plain text inside a code snipper. output only the code snippet with no comments and only containing the bitmap, where 1 is on and 0 is off."; 
    
    await processMessageToChatGPT([{ message, direction: 'outgoing', sender: "user" }]);
  };

  async function processMessageToChatGPT(chatMessages) { 
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });

    const apiRequestBody = { "model": "gpt-3.5-turbo", "messages": [ systemMessage, ...apiMessages ] }
    // const apiRequestBody = { "model": "gpt-4", "messages": [ systemMessage, ...apiMessages ] }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data.choices[0].message.content);
      const match = data.choices[0].message.content.replace(/(\r\n|\n|\r)/gm,"").match(/```([^`]+)```/);
      if (match && match[1]) {
        sendCommand(match[1].replace(/\D/g,''));
        loader.current.className = "loader";
      }
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson.input);
    handleSend(formJson.input);
  }

  const { transcript, resetTranscript } = useSpeechRecognition();

  const sendTranscript = (transcript) => {
    handleSend(transcript);
    input.current.defaultValue = transcript;
    resetTranscript();
  };

  return (
    <div className="App">
      <div className='connection'>{connection ? <div><button onClick={() => randomCommand()}>flush</button><button className='disconnect' onClick={turnOff}>disconnect</button></div> : <button className='connect' onClick={turnOn}>connect</button>}</div>
      <div className="loader" ref={loader}></div>
      <div className='input-box'> 

        <form method="post" onSubmit={handleSubmit}>
          Draw a <br/> 
          <input name="input" defaultValue="" placeholder='circle' ref={input}/>
          <button type="submit">Send</button>
        </form>

        <button onClick={SpeechRecognition.startListening}>Start</button>
        <button onClick={() => {SpeechRecognition.stopListening(); sendTranscript(transcript);}}>Stop</button>
        {/* {transcript} */}
      </div>
    </div>
  )
}

export default App;