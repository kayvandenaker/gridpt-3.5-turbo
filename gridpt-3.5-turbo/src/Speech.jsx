import React, {useEffect, useState} from 'react';
import 'regenerator-runtime/runtime'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Speech = ({onTranscriptChange}) => {
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  useEffect(() => {
    onTranscriptChange(transcript);
    resetTranscript();
    console.log(transcript);
  }, [transcript, onTranscriptChange]);

  return (
    <div>
      {/* <button className='listen-dontlisten' onClick={() => { 
        if (listening) {
          SpeechRecognition.stopListening();
        } else {
          SpeechRecognition.startListening();
        }
      }}>
        {listening ? <p>listening</p> : <p>not listening</p>}
      </button> */}
        <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <p>{transcript}</p>
    </div>
  );
};
export default Speech;