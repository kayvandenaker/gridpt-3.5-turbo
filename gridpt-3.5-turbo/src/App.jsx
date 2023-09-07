import { useState, useEffect } from 'react';
import { BrowserSerial } from "browser-serial";
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';


const systemMessage = { 
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}

function App() {
  const [connection, setConnection] = useState(false);
  const serial = new BrowserSerial();

  const turnOn = () => {
    setConnection(true);
  };

  const turnOff = () => {
    setConnection(false);
  };

  const sendCommand = (msg) => {
    if (connection) {
      serial.write(msg)
        .then(() => {
          console.log(`Sent command to serial port: `, msg);
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

  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);

  const handleSend = async (message) => {
    sendCommand("1000000000000000000000000001100000011000000000000000000000000001");

    // draw an "up arrow" in a 8x8 binary grid. use 1 for on and 0 for off. output only a code snippet in plain text with no commas, so nothing else except the numbers
    message = "Draw a " + message + " in an 8x8 binary grid. use 1 for on and 0 for off. output only a code snippet in plain text with no commas and nothing else except the numbers. the numbers should be surrounded by ``` on both sides"; 

    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    // setMessages(newMessages);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage, 
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + "api key",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      // console.log(data);
      // setMessages([...chatMessages, {
      //   message: data.choices[0].message.content,
      //   sender: "ChatGPT"
      // }]);
      // console.log(data.choices[0].message.content.replace(/(\r\n|\n|\r)/gm,"").match(/```([^`]+)```/));
      const match = data.choices[0].message.content.replace(/(\r\n|\n|\r)/gm,"").match(/```([^`]+)```/);
      if (match && match[1]) {
        console.log("sending...", match[1]);
        // console.log(match[1].replace(/(\r\n|\n|\r)/gm,""));
        sendCommand(match[1]);
      }
    });
  }

  return (
    <div className="App">
      <div className='input-box'> 
        <button className='connect' onClick={turnOn}>connect</button>
        <button className='disconnect' onClick={turnOff}>disconnect</button>
        <button onClick={() => sendCommand("0001100000111100011111100001100000011000000110000000000000000000")}>Test Command</button>
        <button onClick={() => sendCommand("0001100000111100011111100001100000011000000110000000000000000011")}>Test Command 2</button>
        <button onClick={() => randomCommand()}>Test Command 2</button>
        <br/>
        Draw a
        <MessageInput placeholder="circle" onSend={handleSend} />  
      </div>
        {/* <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={null}
            >
              {messages.map((message, i) => {
                // const match = message.message.match(/```([^`]+)```/);
                // if (match && match[1]) {
                  // console.log(match[1].replace(/(\r\n|\n|\r)/gm,""));
                  // sendCommand(match[1].replace(/(\r\n|\n|\r)/gm,"") + "\n");
                // }
                return <Message key={i} model={message} />
              })}
            </MessageList>
          </ChatContainer>
        </MainContainer> */}
    </div>
  )
}

export default App;