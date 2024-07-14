"use client"
import { Button } from "@/components/ui/button";
import React from "react";
import { useVoiceToText } from "react-speakup";

const VoiceToTextComponent = () => {
  const { startListening, stopListening, transcript } = useVoiceToText();

  return (
    <div>
      <Button onClick={startListening}>Start Listening</Button>
      <Button onClick={stopListening}>Stop Listening</Button>
      <br/>
      <span className="m-4 p-4">{transcript}</span>
    </div>
  );
};

export default VoiceToTextComponent; 