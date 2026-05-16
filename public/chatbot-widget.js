(function() {
  const scriptTag = document.currentScript || document.querySelector('script[src*="chatbot-widget.js"]');
  const host = scriptTag ? new URL(scriptTag.src).origin : "https://ts26.nsg.edu.vn";
  
  const color = scriptTag?.getAttribute("data-color") || "#2563eb";
  const position = scriptTag?.getAttribute("data-position") || "right";
  const title = scriptTag?.getAttribute("data-title") || "Tư vấn tuyển sinh";
  const logo = scriptTag?.getAttribute("data-logo") || "";

  // Set charset for ensuring unicode is parsed if server didn't send header
  // Note: best practice is adding charset="utf-8" to the script tag, e.g. <script charset="utf-8" src="...">

  // Inject CSS
  const style = document.createElement("style");
  style.innerHTML = `
    .ai-chatbot-btn {
      position: fixed;
      bottom: 20px;
      ${position}: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: ${color};
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .ai-chatbot-btn:hover { transform: scale(1.05); }
    .ai-chatbot-container {
      position: fixed;
      bottom: 85px;
      ${position}: 20px;
      width: 360px;
      height: 500px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 100px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      z-index: 999999;
      overflow: hidden;
      font-family: Arial, Helvetica, system-ui, -apple-system, sans-serif;
      transform: translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
    }
    .ai-chatbot-container.open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    .ai-chatbot-header {
      padding: 12px 16px;
      background: white;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ai-chatbot-info { display: flex; align-items: center; gap: 8px; }
    .ai-chatbot-logo { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #eee; }
    .ai-chatbot-title { font-size: 14px; font-weight: 700; color: #1e3a8a; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .ai-chatbot-close { background: none; border: none; font-size: 24px; line-height: 1; color: #64748b; cursor: pointer; }
    .ai-chatbot-messages {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 0;
    }
    .ai-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; font-family: Arial, Helvetica, sans-serif; }
    .ai-msg.user { background: ${color}; color: white; align-self: flex-end; border-bottom-right-radius: 2px; }
    .ai-msg.bot { background: white; color: #1e293b; border: 1px solid #e2e8f0; align-self: flex-start; border-bottom-left-radius: 2px; }
    .ai-bot-typing { display: flex; gap: 4px; padding: 12px 14px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; border-bottom-left-radius: 2px; align-self: flex-start; align-items: center; }
    .ai-dot { width: 6px; height: 6px; background: #cbd5e1; border-radius: 50%; animation: ai-bounce 1.4s infinite ease-in-out both; }
    .ai-dot:nth-child(1) { animation-delay: -0.32s; }
    .ai-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes ai-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    .ai-chatbot-form { padding: 12px; border-top: 1px solid #eee; display: flex; gap: 8px; background: white; margin: 0; }
    .ai-chatbot-input { flex: 1; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none; margin: 0; font-family: Arial, Helvetica, sans-serif; }
    .ai-chatbot-input:focus { border-color: ${color}; box-shadow: 0 0 0 2px ${color}33; }
    .ai-chatbot-submit { background: ${color}; color: white; border: none; border-radius: 6px; padding: 0 16px; font-size: 14px; cursor: pointer; transition: opacity 0.2s; margin: 0; font-weight: bold; }
    .ai-chatbot-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // HTML Structure
  const wrapper = document.createElement("div");
  // ensure isolated styling
  wrapper.style.all = "initial";
  
  wrapper.innerHTML = `
    <button class="ai-chatbot-btn" aria-label="Mở chat">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    </button>
    <div class="ai-chatbot-container">
      <div class="ai-chatbot-header">
        <div class="ai-chatbot-info">
          ${logo ? `<img src="${logo}" class="ai-chatbot-logo" alt="Logo" />` : `<div class="ai-chatbot-logo" style="background:#f1f5f9; display:flex; align-items:center; justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></div>`}
          <h3 class="ai-chatbot-title">${title}</h3>
        </div>
        <button class="ai-chatbot-close" title="Đóng">&times;</button>
      </div>
      <div class="ai-chatbot-messages">
        <div class="ai-msg bot" style="background:#eff6ff; border-color:#dbeafe; color:#1e3a8a;">
          <b><span style="font-size:18px;">👋</span> Xin chào!</b><br/>Tôi là chatbot tư vấn tuyển sinh và giới thiệu về <b>${title}</b>.<br/>Bạn hãy đặt câu hỏi để được tư vấn nhé!<br/><i style="color:#64748b; font-size:13px;">Ví dụ: "Học phí", "Hồ sơ xét tuyển", "Cơ hội việc làm"...</i>
        </div>
      </div>
      <form class="ai-chatbot-form">
        <input type="text" class="ai-chatbot-input" placeholder="Nhập câu hỏi..." autocomplete="off" />
        <button type="submit" class="ai-chatbot-submit">Gửi</button>
      </form>
    </div>
  `;
  document.body.appendChild(wrapper);

  // Logic
  const btn = wrapper.querySelector(".ai-chatbot-btn");
  const container = wrapper.querySelector(".ai-chatbot-container");
  const closeBtn = wrapper.querySelector(".ai-chatbot-close");
  const form = wrapper.querySelector(".ai-chatbot-form");
  const input = wrapper.querySelector(".ai-chatbot-input");
  const msgsDiv = wrapper.querySelector(".ai-chatbot-messages");
  const submitBtn = wrapper.querySelector(".ai-chatbot-submit");

  let isOpen = false;
  let isLoading = false;
  let chatHistory = [];

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      container.classList.add("open");
      input.focus();
    } else {
      container.classList.remove("open");
    }
  }

  btn.addEventListener("click", toggle);
  closeBtn.addEventListener("click", toggle);

  function addMsg(text, isUser) {
    const d = document.createElement("div");
    d.className = "ai-msg " + (isUser ? "user" : "bot");
    // format text (simple markdown bold/newlines)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    formatted = formatted.replace(/\n/g, "<br/>");
    d.innerHTML = formatted;
    msgsDiv.appendChild(d);
    msgsDiv.scrollTop = msgsDiv.scrollHeight;
    return d;
  }

  function showTyping() {
    const d = document.createElement("div");
    d.className = "ai-bot-typing";
    d.innerHTML = `<div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div>`;
    msgsDiv.appendChild(d);
    msgsDiv.scrollTop = msgsDiv.scrollHeight;
    return d;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || isLoading) return;

    input.value = "";
    addMsg(text, true);
    chatHistory.push({ role: "user", content: text });
    
    isLoading = true;
    submitBtn.disabled = true;
    input.disabled = true;
    
    const typingMsg = showTyping();

    try {
      const res = await fetch(host + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!res.ok) throw new Error("API error");

      let currentReplyDiv = null;
      let currentContent = "";
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        if (value) {
          if (!currentReplyDiv) {
             typingMsg.remove();
             currentReplyDiv = document.createElement("div");
             currentReplyDiv.className = "ai-msg bot";
             msgsDiv.appendChild(currentReplyDiv);
          }
          currentContent += decoder.decode(value, { stream: true });
          
          let formatted = currentContent.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
          formatted = formatted.replace(/\n/g, "<br/>");
          currentReplyDiv.innerHTML = formatted;
          msgsDiv.scrollTop = msgsDiv.scrollHeight;
        }
      }
      chatHistory.push({ role: "assistant", content: currentContent });

    } catch (err) {
      typingMsg.remove();
      addMsg("Xin lỗi, hiện tại đang có lỗi kết nối. Vui lòng thử lại sau.", false);
    } finally {
      isLoading = false;
      submitBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  });

})();