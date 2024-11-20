"use client"

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
// use tts from   const { speak, pause, resume, ref, setVoice, voices } = useTextToVoice<HTMLDivElement>();

import React, { useEffect } from "react";
import { useTextToVoice } from "react-speakup";

interface TTSContext {
    setTTSContent: (content: React.ReactNode) => void;
}

const TTSContext = React.createContext<TTSContext | undefined>(undefined);

export function useTTS() {
    const context = React.useContext(TTSContext);
    if (!context) {
        throw new Error('useTTSContext must be used within a TTSProvider');
    }
    return context;
}

interface TTSProviderProps {
    children: React.ReactNode
}

export function TTSProvider({ children }: TTSProviderProps) {
    // const { speak, pause, resume, ref, setVoice, voices, isSpeaking } = useTextToVoice<HTMLDivElement>();
    const [TTSContent, setTTSContent] = React.useState<React.ReactNode>('');

    // useEffect(() => {
    //     if (TTSContent) {
    //         console.log('TTSContent')
    //         // speak()
    //     }
    // }, [TTSContent])

    // useEffect(() => {
    //     console.log("speaking",isSpeaking)
    // }, [isSpeaking])

    return (
        <TTSContext.Provider
            value={{ setTTSContent }}>
            {/* <Drawer open={true} onClose={pause}>
                <DrawerContent>
                    <DrawerHeader className="flex-row">
                        <DrawerTitle>TTS Service</DrawerTitle>
                        <Button onClick={isSpeaking ? pause : speak}>play/pause</Button>
                        <DrawerDescription className="p-6" ref={ref}>
                            Hello testing
                        </DrawerDescription>
                    </DrawerHeader>
                </DrawerContent>
            </Drawer> */}
            {children}
        </TTSContext.Provider>
    );
}
