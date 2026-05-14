"use client";

import { useRef } from "react";
import toast from "react-hot-toast";
import { updateConfigAction } from "./actions";
import SubmitButtons from "./SubmitButtons";
import DragDropUpload from "@/components/DragDropUpload";

export default function SettingsForm({ configMap }: { configMap: Record<string, string> }) {
  const formRef = useRef<HTMLFormElement>(null);

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

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-8">
      {/* SEO & Logo Config */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Link Logo</label>
            <DragDropUpload name="logo_url" defaultValue={configMap["logo_url"] || ""} accept="image/*" label="Kéo thả logo vào đây (hoặc click để chọn)" />
          </div>
        </div>
      </div>

      {/* Footer Config */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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

      {/* Drive Config */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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

      {/* SMTP Config */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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

      {/* Widget/Script Config */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
        </div>
      </div>

      <SubmitButtons />
    </form>
  );
}