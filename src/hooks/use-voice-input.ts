import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

type VoiceStatus = "idle" | "listening" | "success" | "error";

interface UseVoiceInputOptions {
  type: "number" | "grade" | "text";
  min?: number;
  max?: number;
  onResult: (value: string) => void;
}

// Singleton: only one recognition active at a time
let activeRecognition: any = null;
let activeStopCallback: (() => void) | null = null;

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export const isVoiceSupported = !!SpeechRecognitionAPI;

// Word-to-number map
const WORD_NUMBERS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
};

function wordsToNumber(text: string): number | null {
  // Try direct numeric parse first
  const direct = parseFloat(text);
  if (!isNaN(direct)) return direct;

  const words = text.toLowerCase().replace(/[^a-z0-9. ]/g, "").split(/\s+/);
  let total = 0;
  let decimal = 0;
  let isDecimal = false;
  let decimalPlace = 1;
  let foundAny = false;

  for (const word of words) {
    if (word === "point" || word === "dot") {
      isDecimal = true;
      continue;
    }
    const num = WORD_NUMBERS[word] ?? (isNaN(Number(word)) ? null : Number(word));
    if (num === null) continue;
    foundAny = true;

    if (isDecimal) {
      decimalPlace *= 10;
      decimal += num / decimalPlace;
    } else if (num === 100 && total > 0) {
      total *= 100;
    } else {
      total += num;
    }
  }

  return foundAny ? total + decimal : null;
}

// Grade label parsing
const GRADE_MAP: Record<string, string> = {
  o: "O",
  "a plus": "A+", "a+": "A+", "a +": "A+",
  a: "A",
  "b plus": "B+", "b+": "B+", "b +": "B+",
  b: "B",
  c: "C",
  p: "P",
  i: "I",
  "ab": "Ab/R", "absent": "Ab/R", "ab/r": "Ab/R", "abr": "Ab/R",
  "l": "L/AB", "lab": "L/AB", "l/ab": "L/AB", "l ab": "L/AB",
};

function parseGrade(text: string): string | null {
  const cleaned = text.toLowerCase().trim();
  // Check longest matches first
  for (const [key, value] of Object.entries(GRADE_MAP).sort((a, b) => b[0].length - a[0].length)) {
    if (cleaned === key || cleaned.includes(key)) {
      return value;
    }
  }
  return null;
}

export function useVoiceInput({ type, min, max, onResult }: UseVoiceInputOptions) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (activeRecognition === recognitionRef.current) {
      activeRecognition = null;
      activeStopCallback = null;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    // Stop any active recognition
    if (activeRecognition && activeStopCallback) {
      activeStopCallback();
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognitionRef.current = recognition;
    activeRecognition = recognition;
    activeStopCallback = stopListening;

    recognition.onstart = () => {
      setStatus("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();

      if (type === "grade") {
        const grade = parseGrade(transcript);
        if (grade) {
          setStatus("success");
          onResult(grade);
          toast.success(`Grade entered: ${grade} ✅`);
          setTimeout(() => setStatus("idle"), 1500);
        } else {
          setStatus("error");
          toast.error("Couldn't understand. Please try again 🔄");
          setTimeout(() => setStatus("idle"), 1500);
        }
      } else if (type === "number") {
        const num = wordsToNumber(transcript);
        if (num !== null) {
          const lo = min ?? -Infinity;
          const hi = max ?? Infinity;
          if (num < lo || num > hi) {
            setStatus("error");
            toast.error(`Invalid value. Please say a number ${lo}-${hi} ⚠️`);
            setTimeout(() => setStatus("idle"), 1500);
          } else {
            setStatus("success");
            onResult(String(num));
            toast.success(`Value entered: ${num} ✅`);
            setTimeout(() => setStatus("idle"), 1500);
          }
        } else {
          setStatus("error");
          toast.error("Couldn't understand. Please try again 🔄");
          setTimeout(() => setStatus("idle"), 1500);
        }
      } else {
        // text type
        setStatus("success");
        onResult(transcript);
        toast.success(`Entered: ${transcript} ✅`);
        setTimeout(() => setStatus("idle"), 1500);
      }

      stopListening();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow mic access ❌");
      } else if (event.error !== "aborted") {
        toast.error("Couldn't understand. Please try again 🔄");
      }
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
      stopListening();
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        activeRecognition = null;
        activeStopCallback = null;
      }
    };

    try {
      recognition.start();
      // Auto-stop after 5 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current === recognition) {
          stopListening();
          setStatus("idle");
        }
      }, 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
    }
  }, [type, min, max, onResult, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { status, startListening, stopListening, isSupported: isVoiceSupported };
}
