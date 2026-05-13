"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateConfigAction(formData: FormData) {
  try {
    const GDRIVE_FOLDER_ID = formData.get("GDRIVE_FOLDER_ID")?.toString() || "";
    const GDRIVE_SERVICE_EMAIL = formData.get("GDRIVE_SERVICE_EMAIL")?.toString() || "";
    const GDRIVE_PRIVATE_KEY = formData.get("GDRIVE_PRIVATE_KEY")?.toString() || "";
    const SMTP_HOST = formData.get("SMTP_HOST")?.toString() || "";
    const SMTP_PORT = formData.get("SMTP_PORT")?.toString() || "";
    const SMTP_USER = formData.get("SMTP_USER")?.toString() || "";
    const SMTP_PASS = formData.get("SMTP_PASS")?.toString() || "";

    const settingsToUpdate = [
      { key: "GDRIVE_FOLDER_ID", value: GDRIVE_FOLDER_ID },
      { key: "GDRIVE_SERVICE_EMAIL", value: GDRIVE_SERVICE_EMAIL },
      { key: "GDRIVE_PRIVATE_KEY", value: GDRIVE_PRIVATE_KEY },
      { key: "SMTP_HOST", value: SMTP_HOST },
      { key: "SMTP_PORT", value: SMTP_PORT },
      { key: "SMTP_USER", value: SMTP_USER },
      { key: "SMTP_PASS", value: SMTP_PASS },
    ];

    for (const setting of settingsToUpdate) {
      await prisma.systemConfig.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    revalidatePath("/admin/settings");
    return { success: true, message: "Lưu cấu hình hệ thống thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Đã có lỗi xảy ra khi lưu." };
  }
}
