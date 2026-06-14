import { useState, useEffect, useCallback } from 'react';

// Định nghĩa types cho Web Speech API để không bị lỗi TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
}

export function useVoiceRecognition(
  onResult?: (text: string) => void
): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false; // Chỉ nhận diện 1 câu rồi dừng
        recognitionInstance.interimResults = true; // Lấy kết quả tạm thời
        recognitionInstance.lang = 'vi-VN';

        recognitionInstance.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
             currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          
          // Khi nhận diện xong một cụm
          if (event.results[0].isFinal && onResult) {
            onResult(currentTranscript.trim());
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('');
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error('Lỗi khi bắt đầu nhận diện:', e);
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport: !!recognition,
  };
}
