"use client"
import { useTextToVoice } from "react-speakup";

export default function TTS() {
    const { speak, pause, resume, ref, setVoice, voices, isSpeaking } = useTextToVoice<HTMLDivElement>();

    return (
        <>
            <div>
                <button onClick={speak}>Speak</button>
                <button onClick={pause}>Pause</button>
                <button onClick={resume}>Resume</button>
                <select
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        setVoice(event.target.value)
                    }
                >
                    {voices.map((voice: any) => (
                        <option key={voice}>{voice}</option>
                    ))}
                </select>
                <div ref={ref}>
                    <h1>It's not important which HTML tag your text is within.</h1>
                    <div>
                        Or <p>how many levels it is nested.</p>
                    </div>
                </div>
            </div>
        </>
    )
}