"use server";

import { uploadToDrive } from "@/lib/gdrive";

export async function uploadFileAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Không tìm thấy file");

    const result = await uploadToDrive(file, file.name, file.type);
    return { success: true, url: result.url };
  } catch (error: any) {
    console.error("Lỗi upload:", error);
    return { success: false, error: error.message };
  }
}
