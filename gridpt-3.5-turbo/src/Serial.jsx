import { useState, useEffect } from 'react';
import './App.css';
import { BrowserSerial } from "browser-serial";

function Serial() {
  const [connection, setConnection] = useState(false);
//   const [inputValue, setInputValue] = useState(''); 

  const serial = new BrowserSerial();

  const turnOn = () => {
    setConnection(true);
  };

  const turnOff = () => {
    setConnection(false);
  };

  const sendCommand = () => {
    if (connection) {
      serial.write("0001100000111100011111100001100000011000000110000000000000000000")
        .then(() => {
          console.log(`Sent command to serial port`);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  useEffect(() => {
    if (connection) {
      serial.connect()
        .then(() => {
          console.log('Connected to serial port');
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

  return (
    <div className="Serial">
        <button className='connect' onClick={turnOn}>connect</button>
        <button className='disconnect' onClick={turnOff}>disconnect</button>
        <button onClick={sendCommand}>Send Command</button>
    </div>
  );
}

export default Serial;
