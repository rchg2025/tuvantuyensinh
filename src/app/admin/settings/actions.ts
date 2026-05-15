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
      "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS",
      "seo_title", "google_site_verification", "seo_description",
      "logo_url", "default_og_image", "footer_description", "footer_email",
      "footer_phone", "zalo_oa_widget"
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

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true, message: "Lưu cái đặt thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Có lỗi xảy ra!" };
  }
}
