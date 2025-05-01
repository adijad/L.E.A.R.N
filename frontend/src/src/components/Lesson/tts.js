import React, { useState } from "react";
import axios from "axios";
import languageOptions from "../../constants/languageOptions";

// Helper function to map a language code to its user-friendly label.
const getLabelFromCode = (code) => {
    const lang = languageOptions.find((l) => l.code === code);
    return lang ? lang.label : "English (USA)";
};

const TTSSection = ({ text, currentLanguage }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const triggerTTS = async () => {
        if (isPlaying) {
            // Optionally, implement stop functionality if desired.
            setIsPlaying(false);
            return;
        }
        // If you haven't already obtained an audio URL for this text, call your TTS API.
        if (!audioUrl) {
            setIsLoading(true);
            try {
                // Replace with your actual backend endpoint and payload as needed.
                const response = await axios.post(`http://127.0.0.1:8000/tts?language=${encodeURIComponent(
                    getLabelFromCode(currentLanguage)
                )}`, {
                    text,
                });
                // Assume your response returns a field named "audioUrl"
                const url = response.data.audioUrl;
                setAudioUrl(url);
                playAudio(url);
            } catch (error) {
                console.error("TTS API error: ", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            playAudio(audioUrl);
        }
    };

    const playAudio = (url) => {
        const audio = new Audio(url);
        audio.play();
        setIsPlaying(true);
        audio.onended = () => {
            setIsPlaying(false);
        };
    };

    return (
        <span style={{ marginLeft: "8px" }}>
            <button onClick={triggerTTS} disabled={isLoading} title="Listen">
                {isLoading ? (
                    "⏳" // Show a loading indicator (or spinner) while waiting
                ) : (
                    <i className="fa fa-volume-up" aria-hidden="true"></i> // Speaker icon (e.g. FontAwesome)
                )}
            </button>
        </span>
    );
};

export default TTSSection;
