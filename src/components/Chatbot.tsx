"use client";

import { useState, useRef, useEffect } from 'react';

export default function Chatbot({ color = "#2563eb", position = "right", width = "360px", height = "500px", logoUrl, siteTitle }: { color?: string; position?: string; width?: string; height?: string; logoUrl?: string; siteTitle?: string }) {
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
          <div 
            className="p-3 flex justify-between items-center shadow-sm"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
          >
            <div className="flex items-center gap-2">
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full border border-white/20 p-0.5 object-cover bg-white" />
              )}
              <h3 className="font-bold text-sm leading-tight text-white line-clamp-2 max-w-[220px]">
                {siteTitle || "Tư vấn tuyển sinh và giới thiệu về nhà trường"}
              </h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white focus:outline-none ml-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="bg-blue-50/80 text-blue-900 border border-blue-100 p-4 rounded-xl text-sm leading-relaxed mt-2 mx-1 shadow-sm">
                <p className="font-bold flex items-center gap-2 mb-2 text-base">
                  <span className="text-xl">👋</span> Xin chào!
                </p>
                <p className="mb-2">
                  Tôi là chatbot tư vấn tuyển sinh và giới thiệu về <strong>{siteTitle || 'nhà trường'}</strong>.
                  Bạn hãy đặt câu hỏi để được tư vấn nhé!
                </p>
                <p className="text-gray-600 italic">
                  Ví dụ: "Học phí", "Hồ sơ xét tuyển", "Cơ hội việc làm"...
                </p>
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
        <div className="relative flex items-center group cursor-pointer" onClick={() => setIsOpen(true)}>
          {/* Bouncing Tooltip */}
          <div className={`absolute ${position === "left" ? "left-full ml-4" : "right-full mr-4"} animate-bounce`}>
            <div className={`bg-white text-blue-600 font-bold text-sm p-3 rounded-2xl shadow-xl border border-blue-100 flex flex-col items-center justify-center whitespace-nowrap relative`}>
              <img src="/chatbot-avatar.png" alt="AI Avatar" className="w-20 h-20 object-contain drop-shadow-md mb-1 hover:scale-110 transition-transform" />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg animate-pulse">✨</span> Chat với tư vấn viên AI
              </div>
              {/* Arrow */}
              <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white transform rotate-45 ${
                position === "left" 
                  ? "-left-1.5 border-b border-l border-blue-100" 
                  : "-right-1.5 border-t border-r border-blue-100"
              }`}></div>
            </div>
          </div>

          {/* Pulse Ring */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: color }}></div>
          
          <button
            className="relative text-white rounded-full p-3 shadow-2xl transition-all transform group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center h-14 w-14"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <path d="M12 8V4H8"/>
              <rect width="16" height="12" x="4" y="8" rx="2"/>
              <path d="M2 14h2"/>
              <path d="M20 14h2"/>
              <path d="M15 13v2"/>
              <path d="M9 13v2"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
