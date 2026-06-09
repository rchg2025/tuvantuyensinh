"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { testDriveConnection } from "@/lib/gdrive";

export async function testDriveAction() {
  return await testDriveConnection();
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
      "chatbot_width", "chatbot_height"
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

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true, message: "Lưu cái đặt thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Có lỗi xảy ra!" };
  }
}
