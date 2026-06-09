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
    .ai-launcher-wrapper {
      position: fixed;
      bottom: 20px;
      ${position}: 20px;
      z-index: 999999;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .ai-launcher-tooltip-container {
      position: absolute;
      ${position === "left" ? "left: 100%; margin-left: 16px;" : "right: 100%; margin-right: 16px;"}
      animation: ai-bounce-y 1s infinite alternate ease-in-out;
    }
    @keyframes ai-bounce-y {
      0% { transform: translateY(0); }
      100% { transform: translateY(-8px); }
    }
    @keyframes ai-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
    .ai-launcher-tooltip {
      background: white;
      color: #2563eb;
      font-weight: bold;
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 16px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      border: 1px solid #dbeafe;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      position: relative;
    }
    .ai-launcher-tooltip-icon {
      font-size: 18px;
      animation: ai-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .ai-launcher-tooltip-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
      width: 12px;
      height: 12px;
      background: white;
      ${position === "left" ? "left: -6px; border-bottom: 1px solid #dbeafe; border-left: 1px solid #dbeafe;" : "right: -6px; border-top: 1px solid #dbeafe; border-right: 1px solid #dbeafe;"}
    }
    .ai-launcher-pulse-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background-color: ${color};
      opacity: 0.3;
      animation: ai-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    @keyframes ai-ping {
      75%, 100% { transform: scale(1.5); opacity: 0; }
    }
    .ai-chatbot-btn {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${color}, ${color}cc);
      color: white;
      border: 2px solid white;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      overflow: hidden;
      padding: 0;
    }
    .ai-launcher-wrapper:hover .ai-chatbot-btn {
      transform: scale(1.1);
    }
    .ai-chatbot-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: white;
    }
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
    
    .ai-chatbot-actions { display: flex; align-items: center; gap: 8px; }
    .ai-chatbot-action-btn { background: none; border: none; line-height: 1; color: #64748b; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s; }
    .ai-chatbot-action-btn:hover { background: #f1f5f9; color: #0f172a; }
    
    .ai-rating-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,0.95); z-index: 10;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 20px; text-align: center; opacity: 0; pointer-events: none; transition: opacity 0.3s;
    }
    .ai-rating-overlay.active { opacity: 1; pointer-events: all; }
    
    .ai-stars { display: flex; gap: 8px; margin: 15px 0; }
    .ai-star { font-size: 32px; color: #cbd5e1; cursor: pointer; transition: color 0.2s; }
    .ai-star:hover, .ai-star.active { color: #f59e0b; }
    .ai-rating-feedback { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 15px; resize: none; font-family: inherit; font-size: 14px; box-sizing: border-box; }
    .ai-rating-submit { background: ${color}; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 8px; font-size: 14px; }
    .ai-rating-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .ai-rating-skip { background: none; border: none; color: #64748b; font-size: 14px; cursor: pointer; text-decoration: underline; padding: 8px; }
  `;
  document.head.appendChild(style);

  // HTML Structure
  const wrapper = document.createElement("div");
  // ensure isolated styling
  wrapper.style.all = "initial";
  
  wrapper.innerHTML = `
    <div class="ai-launcher-wrapper">
      <div class="ai-launcher-tooltip-container">
        <div class="ai-launcher-tooltip">
          <span class="ai-launcher-tooltip-icon">✨</span> Chat với tư vấn viên AI
          <div class="ai-launcher-tooltip-arrow"></div>
        </div>
      </div>
      <div class="ai-launcher-pulse-ring"></div>
      <button class="ai-chatbot-btn" aria-label="Mở chat">
        <img src="${host}/chatbot-avatar.png" alt="AI Avatar" />
      </button>
    </div>
    <div class="ai-chatbot-container">
      <div class="ai-chatbot-header">
        <div class="ai-chatbot-info">
          ${logo ? `<img src="${logo}" class="ai-chatbot-logo" alt="Logo" />` : `<div class="ai-chatbot-logo" style="background:${color}15; color:${color}; display:flex; align-items:center; justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></div>`}
          <h3 class="ai-chatbot-title">${title}</h3>
        </div>
        <div class="ai-chatbot-actions">
          <button class="ai-chatbot-action-btn ai-chatbot-minimize" title="Thu nhỏ" style="font-size: 18px; font-weight: bold; padding-bottom: 8px;">_</button>
          <button class="ai-chatbot-action-btn ai-chatbot-close" title="Đóng & Đánh giá" style="font-size: 24px;">&times;</button>
        </div>
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
      
      <div class="ai-rating-overlay">
        <h3 style="margin:0 0 10px 0; color:#1e293b;">Đánh giá Chatbot</h3>
        <p style="margin:0; font-size:14px; color:#64748b;">Bạn cảm thấy cuộc trò chuyện này hữu ích không?</p>
        <div class="ai-stars">
          <span class="ai-star" data-val="1">★</span>
          <span class="ai-star" data-val="2">★</span>
          <span class="ai-star" data-val="3">★</span>
          <span class="ai-star" data-val="4">★</span>
          <span class="ai-star" data-val="5">★</span>
        </div>
        <textarea class="ai-rating-feedback" rows="3" placeholder="Góp ý thêm (không bắt buộc)..."></textarea>
        <button class="ai-rating-submit">Gửi đánh giá & Đóng</button>
        <button class="ai-rating-skip">Bỏ qua</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // Logic
  const btn = wrapper.querySelector(".ai-launcher-wrapper");
  const container = wrapper.querySelector(".ai-chatbot-container");
  const closeBtn = wrapper.querySelector(".ai-chatbot-close");
  const minimizeBtn = wrapper.querySelector(".ai-chatbot-minimize");
  const form = wrapper.querySelector(".ai-chatbot-form");
  const input = wrapper.querySelector(".ai-chatbot-input");
  const msgsDiv = wrapper.querySelector(".ai-chatbot-messages");
  const submitBtn = wrapper.querySelector(".ai-chatbot-submit");

  const ratingOverlay = wrapper.querySelector(".ai-rating-overlay");
  const stars = wrapper.querySelectorAll(".ai-star");
  const ratingFeedback = wrapper.querySelector(".ai-rating-feedback");
  const ratingSubmit = wrapper.querySelector(".ai-rating-submit");
  const ratingSkip = wrapper.querySelector(".ai-rating-skip");

  let isOpen = false;
  let isLoading = false;
  let chatHistory = [];
  let currentRating = 0;

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      container.classList.add("open");
      input.focus();
    } else {
      container.classList.remove("open");
    }
  }

  function closeAndClear() {
    container.classList.remove("open");
    isOpen = false;
    ratingOverlay.classList.remove("active");
    chatHistory = [];
    currentRating = 0;
    stars.forEach(s => s.classList.remove("active"));
    ratingFeedback.value = "";
    
    msgsDiv.innerHTML = `
      <div class="ai-msg bot" style="background:#eff6ff; border-color:#dbeafe; color:#1e3a8a;">
        <b><span style="font-size:18px;">👋</span> Xin chào!</b><br/>Tôi là chatbot tư vấn tuyển sinh và giới thiệu về <b>${title}</b>.<br/>Bạn hãy đặt câu hỏi để được tư vấn nhé!<br/><i style="color:#64748b; font-size:13px;">Ví dụ: "Học phí", "Hồ sơ xét tuyển", "Cơ hội việc làm"...</i>
      </div>
    `;
  }

  btn.addEventListener("click", toggle);
  minimizeBtn.addEventListener("click", toggle);

  closeBtn.addEventListener("click", () => {
    const hasUserMsg = chatHistory.some(m => m.role === 'user');
    if (hasUserMsg) {
      ratingOverlay.classList.add("active");
    } else {
      closeAndClear();
    }
  });

  stars.forEach(star => {
    star.addEventListener("click", () => {
      currentRating = parseInt(star.getAttribute("data-val"));
      stars.forEach(s => {
        if (parseInt(s.getAttribute("data-val")) <= currentRating) s.classList.add("active");
        else s.classList.remove("active");
      });
    });
  });

  ratingSkip.addEventListener("click", closeAndClear);

  ratingSubmit.addEventListener("click", async () => {
    if (currentRating === 0) {
      alert("Vui lòng chọn số sao đánh giá trước khi gửi!");
      return;
    }
    
    try {
      ratingSubmit.disabled = true;
      ratingSubmit.textContent = "Đang gửi...";
      
      await fetch(host + "/api/chat-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: currentRating,
          feedback: ratingFeedback.value.trim(),
          history: chatHistory
        })
      });
    } catch (e) {
      console.error(e);
    } finally {
      ratingSubmit.disabled = false;
      ratingSubmit.textContent = "Gửi đánh giá & Đóng";
      closeAndClear();
    }
  });

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