"use client";

import { useState, useRef, useEffect } from 'react';

export default function Chatbot({ color = "#2563eb", position = "right" }: { color?: string; position?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!res.ok) throw new Error('API error');
      
      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let done = false;
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = assistantContent;
            return newMessages;
          });
        }
      }

      if (!assistantContent) {
        throw new Error("Empty response");
      }
    } catch (error) {
       console.error(error);
       setMessages(prev => {
         const newMessages = [...prev];
         newMessages[newMessages.length - 1].content = 'Xin lỗi, tôi không thể gọi API vào lúc này. Có thể API Key đã hết hạn hoặc bị từ chối truy cập (Lỗi 403 / Hết Quota). Vui lòng kiểm tra lại cấu hình API Key!';
         return newMessages;
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const posClass = position === "left" ? "left-4" : "right-4";

  return (
    <div className={`fixed bottom-4 ${posClass} z-50`}>
      {isOpen ? (
        <div className="w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="text-white p-3 flex justify-between items-center" style={{ backgroundColor: color }}>
            <h3 className="font-semibold text-sm">Trợ lý ảo Tư vấn Tuyển sinh</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-4">
                Xin chào! Tôi có thể giúp gì cho bạn?
              </div>
            )}
            {messages.map((m, index) => (
              <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-lg p-2 text-sm ${
                    m.role === 'user' 
                      ? 'text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: color } : {}}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 border border-gray-200 rounded-lg rounded-bl-none p-2 text-sm shadow-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                placeholder="Nhập câu hỏi của bạn..."
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="text-white rounded-md px-3 py-2 text-sm transition disabled:opacity-50"
                style={{ backgroundColor: color }}
                disabled={isLoading || !input.trim()}
              >
                Gửi
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center h-14 w-14"
          style={{ backgroundColor: color }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 11.999c0 3.326 2.45 6.182 5.922 7.551M12 20.25V24m-8.13-1.611A8.964 8.964 0 0 1 3 11.999" />
          </svg>
        </button>
      )}
    </div>
  );
}
