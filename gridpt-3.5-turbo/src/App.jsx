import { useState, useEffect } from 'react';
import { BrowserSerial } from "browser-serial";
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MessageInput } from '@chatscope/chat-ui-kit-react';


const systemMessage = { 
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}

function App() {
  const [connection, setConnection] = useState(false);
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
    sendCommand("00111100 01111110 01100110 00001100 00011000 00000000 00011000 00011000");
    console.log("Fetching data for: ", message);

    message = "Draw a " + message + " in an 8x8 binary grid. use 1 for on and 0 for off. output only a code snippet in plain text with no commas and nothing else except the numbers. the numbers should be surrounded by ``` on both sides"; 
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

    const apiRequestBody = { "model": "gpt-4", "messages": [ systemMessage, ...apiMessages ] }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + "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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      // console.log(data);
      const match = data.choices[0].message.content.replace(/(\r\n|\n|\r)/gm,"").match(/```([^`]+)```/);
      if (match && match[1]) {
        sendCommand(match[1]);
      }
    });
  }

  return (
    <div className="App">
        <div className='connection'>{connection ? <button className='disconnect' onClick={turnOff}>disconnect</button> : <button className='connect' onClick={turnOn}>connect</button>}</div>
      <div className='input-box'> 
        Draw a
        <MessageInput placeholder="circle" onSend={handleSend} />  

        <br/>
        <button onClick={() => sendCommand("0001100000111100011111100001100000011000000110000001100000011000")}>↑</button>
        <button onClick={() => randomCommand()}>random</button>
        <button onClick={() => handleSend("rectangle")}>rect</button>
      </div>
    </div>
  )
}

export default App;