import { useState, useEffect, useRef, useCallback } from "react";

interface UseSpeechSynthesisProps {
    onEnd?: () => void;
    onError?: (event: SpeechSynthesisErrorEvent) => void;
}

export function useSpeechSynthesis({ onEnd, onError }: UseSpeechSynthesisProps = {}) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setIsSupported(true);

            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
            };

            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;

            return () => {
                window.speechSynthesis.onvoiceschanged = null;
            }
        }
    }, []);

    const speak = useCallback((text: string, options?: { rate?: number; voice?: SpeechSynthesisVoice | null }) => {
        if (!isSupported) return;

        // Cancel previous
        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        const utterance = new SpeechSynthesisUtterance(text);

        // Use selected voice or default to French
        if (options?.voice) {
            utterance.voice = options.voice;
        } else {
            // Fallback to a French voice if no specific voice selected
            const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
            if (frenchVoice) {
                utterance.voice = frenchVoice;
            }
            utterance.lang = "fr-FR";
        }

        utterance.rate = options?.rate ?? 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            onEnd?.();
        };
        utterance.onerror = (event) => {
            console.error("Speech synthesis error", event);
            setIsSpeaking(false);
            onError?.(event);
        };

        synthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [isSupported, voices, onEnd, onError]);

    const stop = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [isSupported]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isSupported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSupported]);

    return {
        speak,
        stop,
        isSpeaking,
        isSupported,
        voices
    };
}
