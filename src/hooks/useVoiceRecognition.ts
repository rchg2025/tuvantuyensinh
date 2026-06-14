import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [hasSupport, setHasSupport] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    // Chỉ kiểm tra xem trình duyệt có hỗ trợ không trên lần render đầu tiên
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setHasSupport(true);
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (!hasSupport) return;
    
    // Khởi tạo lười (lazy initialization) để tối ưu hiệu năng
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; 
      recognition.interimResults = false; // Tối ưu: Tắt nhận diện tạm thời để tránh giật lag do render quá nhiều
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        const currentTranscript = event.results[0][0].transcript;
        if (onResultRef.current) {
          onResultRef.current(currentTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error('Lỗi khi bắt đầu nhận diện:', e);
    }
  }, [hasSupport]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    transcript: '', // Bỏ sử dụng transcript state để giảm re-render
    startListening,
    stopListening,
    hasRecognitionSupport: hasSupport,
  };
}
