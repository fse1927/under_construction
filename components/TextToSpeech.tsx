"use client";

import { useState, useEffect } from "react";
import { Volume2, PauseCircle, Settings } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface TextToSpeechProps {
    text: string;
}

export default function TextToSpeech({ text }: TextToSpeechProps) {
    const { speak, stop, isSpeaking, isSupported, voices } = useSpeechSynthesis();
    const [rate, setRate] = useState(1.0);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    // Filter for French voices
    const frenchVoices = voices.filter(voice => voice.lang.startsWith('fr'));

    // Load saved voice preference
    useEffect(() => {
        if (voices.length > 0) {
            const savedVoiceName = localStorage.getItem('france-citoyen-tts-voice');
            if (savedVoiceName) {
                const voice = voices.find(v => v.name === savedVoiceName);
                if (voice) setSelectedVoice(voice);
            }
        }
    }, [voices]);

    if (!isSupported) return null;

    const handleToggle = () => {
        if (isSpeaking) {
            stop();
        } else {
            speak(text, { rate, voice: selectedVoice });
        }
    }

    return (
        <div className="flex items-center gap-2 relative">
            <button
                onClick={handleToggle}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200
                    ${isSpeaking
                        ? 'bg-primary text-white shadow-md scale-105'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-sm'
                    }
                `}
                aria-label={isSpeaking ? "Arrêter la lecture" : "Écouter la synthèse vocale"}
            >
                {isSpeaking ? (
                    <>
                        <PauseCircle className="w-5 h-5 animate-pulse" />
                        <span className="text-sm">En lecture...</span>
                    </>
                ) : (
                    <>
                        <Volume2 className="w-5 h-5" />
                        <span className="text-sm">Écouter</span>
                    </>
                )}
            </button>

            <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${showSettings ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                aria-label="Réglages voix"
            >
                <Settings className="w-5 h-5" />
            </button>

            {showSettings && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white p-4 rounded-xl border shadow-lg animate-in fade-in slide-in-from-top-2 w-64 md:w-80">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vitesse (x{rate})</label>
                            <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.25"
                                value={rate}
                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                className="w-full accent-primary h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {frenchVoices.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Voix</label>
                                <select
                                    className="w-full text-sm p-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    onChange={(e) => {
                                        const voice = voices.find(v => v.name === e.target.value);
                                        setSelectedVoice(voice || null);
                                        if (voice) {
                                            localStorage.setItem('france-citoyen-tts-voice', voice.name);
                                        } else {
                                            localStorage.removeItem('france-citoyen-tts-voice');
                                        }
                                    }}
                                    value={selectedVoice?.name || ''}
                                >
                                    <option value="">Voix par défaut</option>
                                    {frenchVoices.map(voice => (
                                        <option key={voice.name} value={voice.name}>
                                            {voice.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
