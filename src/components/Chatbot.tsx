"use client";

import { useState, useRef, useEffect } from 'react';

export default function Chatbot({ color = "#2563eb", position = "right", width = "360px", height = "500px" }: { color?: string; position?: string; width?: string; height?: string }) {
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

  const formatChatContent = (text: string) => {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
    const links: string[] = [];
    
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, title, url) => {
      links.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline font-bold text-blue-600 hover:opacity-80" style="pointer-events: auto; cursor: pointer;">${title}</a>`);
      return `__LINK_${links.length - 1}__`;
    });
  
    html = html.replace(/(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, (match) => {
      links.push(`<a href="${match}" target="_blank" rel="noopener noreferrer" class="underline font-bold text-blue-600 hover:opacity-80" style="pointer-events: auto; cursor: pointer;">${match}</a>`);
      return `__LINK_${links.length - 1}__`;
    });
  
    html = html.replace(/(0\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4})/g, (match) => {
      const cleanNumber = match.replace(/[\s.-]/g, '');
      return `<a href="tel:${cleanNumber}" class="underline font-bold text-blue-600 hover:opacity-80" style="pointer-events: auto; cursor: pointer;">${match}</a>`;
    });
  
    html = html.replace(/__LINK_(\d+)__/g, (match, index) => {
      return links[parseInt(index, 10)];
    });
  
    return html;
  };

  const posClass = position === "left" ? "left-4" : "right-4";

  return (
    <div className={`fixed bottom-4 ${posClass} z-[9999]`}>
      {isOpen ? (
        <div 
          className="bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]"
          style={{ width: width, height: height }}
        >
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
                  className={`max-w-[85%] rounded-lg p-2 text-sm whitespace-pre-wrap ${
                    m.role === 'user' 
                      ? 'text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: color } : {}}
                  dangerouslySetInnerHTML={{ __html: formatChatContent(m.content) }}
                />
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 14.25h7.5M8.25 9.75h7.5m-11.25 6H3c-1.242 0-2.25-1.008-2.25-2.25V6C.75 4.758 1.758 3.75 3 3.75h18c1.242 0 2.25 1.008 2.25 2.25v9.75C23.25 16.992 22.242 18 21 18h-1.5m-15 0v3.375c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18m-12 0h12" />
          </svg>
        </button>
      )}
    </div>
  );
}
