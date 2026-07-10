"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { testDriveConnection } from "@/lib/gdrive";

export async function testDriveAction() {
  return await testDriveConnection();
}

export async function pingSitemapAction() {
  try {
    const sitemapUrl = "https://ts26.nsg.edu.vn/sitemap.xml";
    const googleUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;
    const bingUrl = `https://www.bing.com/ping?sitemap=${sitemapUrl}`;
    
    // Fire and forget requests
    await Promise.allSettled([
      fetch(googleUrl, { method: "GET" }).catch(() => {}),
      fetch(bingUrl, { method: "GET" }).catch(() => {})
    ]);
    
    return { success: true, message: "Đã gửi tín hiệu index sitemap đến Google và Bing thành công!" };
  } catch (error: any) {
    return { success: false, message: "Lỗi khi ping sitemap" };
  }
}

export async function updateConfigAction(formData: FormData) {
  try {
    const ALLOWED_KEYS = [
      "GDRIVE_FOLDER_ID", "GDRIVE_SERVICE_EMAIL", "GDRIVE_PRIVATE_KEY",
      "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_SENDER_NAME",
      "seo_title", "google_site_verification", "seo_description",
      "logo_url", "default_og_image", "footer_description", "footer_email",
      "footer_phone", "zalo_oa_widget",
      "chatbot_gemini_key", "chatbot_color", "chatbot_position",
      "chatbot_width", "chatbot_height", "google_client_id", "google_client_secret"
    ];

    for (const key of ALLOWED_KEYS) {
      if (formData.has(key)) {
        const val = formData.get(key)?.toString() || "";
        await prisma.systemConfig.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val },
        });
      }
    }

    // Handle checkboxes
    const chatbot_enabled = formData.get("chatbot_enabled") === "true" ? "true" : "false";
    await prisma.systemConfig.upsert({
      where: { key: "chatbot_enabled" },
      update: { value: chatbot_enabled },
      create: { key: "chatbot_enabled", value: chatbot_enabled },
    });

    const google_login_enabled = formData.get("google_login_enabled") === "true" ? "true" : "false";
    await prisma.systemConfig.upsert({
      where: { key: "google_login_enabled" },
      update: { value: google_login_enabled },
      create: { key: "google_login_enabled", value: google_login_enabled },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true, message: "Lưu cái đặt thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Có lỗi xảy ra!" };
  }
}
