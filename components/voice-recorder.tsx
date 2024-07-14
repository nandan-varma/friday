"use client"
import React from "react";
import { Button } from "./ui/button";
import { IconMicrophone } from "./ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useVoiceToText } from "react-speakup";


export function VoiceRecorder({
    onRecorded,
}: {
    onRecorded: (url: string) => void;
}) {
    const { startListening, stopListening, transcript } = useVoiceToText();
    const [isRecording, setIsRecording] = React.useState(false);

    React.useEffect(() => {
        if (transcript) {
            onRecorded(transcript);
        }
    }, [transcript]);

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-14"
                        onClick={() => {
                            setIsRecording((prev) => !prev);
                            isRecording ? stopListening()
                                : startListening()
                        }}
                    >
                        <IconMicrophone />
                        <span className="sr-only">Voice Input</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Voice Input</TooltipContent>
            </Tooltip>
        </>
    )
}