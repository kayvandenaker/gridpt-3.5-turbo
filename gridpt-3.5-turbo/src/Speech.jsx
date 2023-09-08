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

  const sendTranscript = () => {
    onTranscriptChange(transcript);
    resetTranscript();
  };

  return (
    <div>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={() => {SpeechRecognition.stopListening(); sendTranscript()}}>Stop</button>
      <p>{transcript}</p>
    </div>
  );
};
export default Speech;