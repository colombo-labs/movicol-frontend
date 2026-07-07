import { useCallback, useRef, useState } from "react";

/**
 * Voice hook using Web Speech API.
 * Simple approach: press mic → speaks → release/tap again → sends.
 * No continuous mode — one utterance at a time, more stable.
 */

interface UseVoiceOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
}

interface UseVoiceReturn {
  isListening: boolean;
  isSpeaking: boolean;
  ttsEnabled: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  toggleTts: () => void;
  isSupported: boolean;
}

export function useVoice({
  lang = "es",
  onResult,
}: UseVoiceOptions = {}): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Tu navegador no soporta reconocimiento de voz. Usa Chrome.");
      return;
    }
    if (isListening) return;
    setError(null);

    const SpeechRecognitionApi =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionApi) {
      setError("SpeechRecognition no disponible.");
      return;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript && onResultRef.current) {
        onResultRef.current(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: Event) => {
      const err = event as Event & { error?: string };
      const errorCode = err.error || "unknown";
      if (errorCode === "no-speech") {
        // Silence detected — not really an error, just no input
        setError("No detecté voz. Toca el micrófono y habla.");
      } else if (errorCode === "not-allowed") {
        setError("Micrófono bloqueado. Ve a Configuración del sitio en Chrome y permite el micrófono.");
      } else if (errorCode === "aborted") {
        // User cancelled — ignore
      } else if (errorCode === "network") {
        setError("Error de red. Chrome necesita conexión para el reconocimiento de voz.");
      } else if (errorCode === "audio-capture") {
        setError("No se detectó micrófono. Verifica que tu dispositivo tenga uno conectado.");
      } else {
        setError(`Error: ${errorCode}. Intenta de nuevo.`);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError("No se pudo iniciar el micrófono.");
    }
  }, [isListening, isSupported, lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!ttsEnabled || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(/ACTION:.*/g, "")
        .replace(
          /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu,
          "",
        )
        .replace(/[\u2022\u2190-\u21FF-]/g, ",")
        .replace(/\*+/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled, lang],
  );

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleTts = useCallback(() => {
    setTtsEnabled((prev) => !prev);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  return {
    isListening,
    isSpeaking,
    ttsEnabled,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleTts,
    isSupported,
  };
}
