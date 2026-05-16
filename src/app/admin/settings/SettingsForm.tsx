"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { updateConfigAction } from "./actions";
import SubmitButtons from "./SubmitButtons";
import DragDropUpload from "@/components/DragDropUpload";

export default function SettingsForm({ configMap }: { configMap: Record<string, string> }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<"seo" | "footer" | "drive" | "smtp" | "scripts" | "chatbot">("seo");

  const handleSubmit = async (formData: FormData) => {
    const loadingToast = toast.loading("Đang lưu cấu hình...");
    try {
      const res = await updateConfigAction(formData);
      if (res.success) {
        toast.success(res.message, { id: loadingToast });
      } else {
        toast.error(res.message, { id: loadingToast });
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi lưu!", { id: loadingToast });
    }
  };

  const tabs = [
    { id: "seo", label: "🌐 SEO & Logo" },
    { id: "footer", label: "📍 Footer" },
    { id: "drive", label: "📁 Google Drive" },
    { id: "smtp", label: "📧 SMTP Email" },
    { id: "scripts", label: "💬 Mã nhúng" },
    { id: "chatbot", label: "🤖 AI Chatbot" }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tabs navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar pb-px">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white border-x border-t border-slate-200 text-blue-600 shadow-[0_1px_0_white] relative z-10 -mb-px"
                  : "bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-x border-t border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-8 bg-white border border-slate-200 rounded-b-lg rounded-tr-lg p-6 shadow-sm -mt-6">
        {/* SEO & Logo Config */}
        <div className={activeTab === "seo" ? "block" : "hidden"}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>🌐</span> Thông tin Website (SEO & Logo)
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề Website (SEO Title)</label>
              <input 
                name="seo_title" 
                defaultValue={configMap["seo_title"] || ""}
                placeholder="VD: Hệ Thống Tư Vấn Tuyển Sinh"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả Website (SEO Description)</label>
              <textarea 
                name="seo_description" 
                rows={3}
                defaultValue={configMap["seo_description"] || ""}
                placeholder="VD: Nền tảng tư vấn hỏi đáp sinh viên..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mã xác minh Google Search Console (Mã Code dạng chuỗi dài)</label>
              <input 
                name="google_site_verification" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" 
                defaultValue={configMap["google_site_verification"] || ""}
                placeholder="Vd: 31X..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Link Logo chung</label>
                <DragDropUpload name="logo_url" defaultValue={configMap["logo_url"] || ""} accept="image/*" label="Kéo thả logo vào đây (hoặc click để chọn)" />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Ảnh đại diện chia sẻ link (OG Image)</label>
                 <DragDropUpload name="default_og_image" defaultValue={configMap["default_og_image"] || ""} accept="image/*" label="Ảnh hiển thị mặc định cho các bài viết không có ảnh" />
              </div>
            </div>
          </div>
        </div>
</div>
        {/* Footer Config */}
        <div className={activeTab === "footer" ? "block" : "hidden"}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📍</span> Thông tin Footer (Cuối trang)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Giới thiệu ngắn (Mô tả footer)</label>
              <textarea 
                name="footer_description"
                rows={2}
                defaultValue={configMap["footer_description"] || ""}
                placeholder="Hệ thống hỗ trợ giải đáp thắc mắc..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email liên hệ</label>
              <input 
                name="footer_email"
                type="email"
                defaultValue={configMap["footer_email"] || ""}
                placeholder="nguyenluyen@nsg.edu.vn"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại liên hệ</label>
              <input 
                name="footer_phone"
                defaultValue={configMap["footer_phone"] || ""}
                placeholder="0123.456.789"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
</div>
        {/* Drive Config */}
        <div className={activeTab === "drive" ? "block" : "hidden"}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📁</span> Cấu hình Google Team Drive (Upload file)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Client Email (Email Service Account)</label>
              <input 
                name="GDRIVE_SERVICE_EMAIL" 
                defaultValue={configMap["GDRIVE_SERVICE_EMAIL"] || ""}
                placeholder="VD: service@project.iam.gserviceaccount.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Private Key (Có thể copy toàn bộ file JSON vào đây)</label>
              <textarea 
                name="GDRIVE_PRIVATE_KEY" 
                rows={10}
                defaultValue={configMap["GDRIVE_PRIVATE_KEY"] || ""}
                placeholder={'{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",\n  ...\n}'}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm whitespace-pre"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Folder ID (Thư mục lưu ảnh)</label>
              <input 
                name="GDRIVE_FOLDER_ID" 
                defaultValue={configMap["GDRIVE_FOLDER_ID"] || ""}
                placeholder="VD: 1A2b3C4d5E6f7G..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>
        </div>
</div>
        {/* SMTP Config */}
        <div className={activeTab === "smtp" ? "block" : "hidden"}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📧</span> Cấu hình SMTP Gmail (Gửi thư thông báo)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SMTP Host</label>
              <input 
                name="SMTP_HOST" 
                title="SMTP Host"
                placeholder="smtp.gmail.com"
                defaultValue={configMap["SMTP_HOST"] || "smtp.gmail.com"}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">SMTP Port</label>
              <input 
                name="SMTP_PORT" 
                title="SMTP Port"
                placeholder="465"
                defaultValue={configMap["SMTP_PORT"] || "465"}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email gửi (SMTP User)</label>
              <input 
                name="SMTP_USER" 
                type="email"
                defaultValue={configMap["SMTP_USER"] || ""}
                placeholder="VD: tuyensinh@gmail.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu ứng dụng (App Password)</label>
              <input 
                name="SMTP_PASS"
                type="password"
                defaultValue={configMap["SMTP_PASS"] || ""}
                placeholder="xxxx xxxx xxxx xxxx"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
</div>
        {/* Widget/Script Config */}
        <div className={activeTab === "scripts" ? "block" : "hidden"}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>💬</span> Mã nhúng (Widget / Script)
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mã Zalo OA Chat Widget</label>
              <textarea 
                name="zalo_oa_widget"
                rows={4}
                defaultValue={configMap["zalo_oa_widget"] || ""}
                placeholder="<!-- Zalo Chat Widget -->&#10;<div class='zalo-chat-widget'...></div>&#10;<script src='...'></script>"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm whitespace-pre"
              ></textarea>
              <p className="text-xs text-slate-500 mt-1">Đoạn mã này sẽ được tự động chèn vào trước thẻ đóng &lt;/body&gt; để hiển thị khung chat trên toàn website.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Bật/Tắt Zalo Widget</label>
                <select name="zalo_enabled" defaultValue={configMap["zalo_enabled"] === "false" ? "false" : "true"} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="true">Bật</option>
                  <option value="false">Tắt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Vị trí hiển thị Zalo</label>
                <select name="zalo_position" defaultValue={configMap["zalo_position"] || "right"} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="right">Góc phải</option>
                  <option value="left">Góc trái</option>
                </select>
              </div>
            </div>
          </div>
        </div>
</div>
        {/* Chatbot Config */}
        <div className={activeTab === "chatbot" ? "block" : "hidden"}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>🤖</span> Cấu hình AI Chatbot
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer w-fit p-2 hover:bg-slate-50 rounded">
                <input 
                  type="checkbox" 
                  name="chatbot_enabled" 
                  defaultChecked={configMap["chatbot_enabled"] !== "false"} 
                  value="true"
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer" 
                />
                Kích hoạt Chatbot AI
              </label>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Gemini API Key</label>
              <input 
                name="chatbot_gemini_key" 
                type="password"
                defaultValue={configMap["chatbot_gemini_key"] || ""}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Lấy tại Google AI Studio. Có thể để trống nếu đã cấu hình trong .env .</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Màu sắc chủ đạo</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  id="color_picker"
                  defaultValue={configMap["chatbot_color"] || "#2563eb"}
                  onChange={(e) => {
                    const input = document.getElementById("chatbot_color_input") as HTMLInputElement;
                    if(input) input.value = e.target.value;
                  }}
                  className="w-10 h-10 border-0 rounded p-0 cursor-pointer h-10 w-10"
                />
                <input 
                  name="chatbot_color" 
                  id="chatbot_color_input"
                  defaultValue={configMap["chatbot_color"] || "#2563eb"}
                  placeholder="#2563eb"
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm uppercase uppercase"
                  onChange={(e) => {
                    const picker = document.getElementById("color_picker") as HTMLInputElement;
                    if(picker) picker.value = e.target.value;
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Vị trí hiển thị</label>
              <select 
                name="chatbot_position" 
                defaultValue={configMap["chatbot_position"] || "right"}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-10 bg-white"
              >
                <option value="right">Góc dưới bên phải</option>
                <option value="left">Góc dưới bên trái</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Chiều rộng khung chat</label>
              <input 
                name="chatbot_width" 
                defaultValue={configMap["chatbot_width"] || "320px"}
                placeholder="VD: 320px, 400px..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-10 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Chiều cao khung chat</label>
              <input 
                name="chatbot_height" 
                defaultValue={configMap["chatbot_height"] || "480px"}
                placeholder="VD: 480px, 600px..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-10 bg-white"
              />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 mb-2">Mã nhúng (Widget) chèn vào website khác</h4>
            <p className="text-sm text-slate-500 mb-4">Để hiển thị Chatbot AI trên một trang web khác, bạn hãy sao chép đoạn mã dưới đây và dán vào trước thẻ <code className="bg-slate-100 px-1 rounded">&lt;/body&gt;</code> của trang web đó.</p>
            <div className="relative">
              <textarea 
                readOnly
                className="w-full h-32 px-4 py-3 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={`<!-- AI Chatbot Widget -->\n<script charset="utf-8" src="https://ts26.nsg.edu.vn/chatbot-widget.js"\n  data-color="${configMap["chatbot_color"] || "#2563eb"}"\n  data-position="${configMap["chatbot_position"] || "right"}"\n  data-title="Tư vấn tuyển sinh"\n></script>\n<!-- End AI Chatbot Widget -->`}
              />
              <button 
                type="button"
                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                onClick={(e) => {
                  const target = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                  if (target) {
                    target.select();
                    document.execCommand("copy");
                    alert("Đã copy mã nhúng!");
                  }
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
</div>
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <SubmitButtons />
        </div>
      </form>
    </div>
  );
}