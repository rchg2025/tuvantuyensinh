"use server";

import { uploadToDrive, getDirectImageUrl } from "@/lib/gdrive";

export async function uploadFileAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("Không tìm thấy file");

    const result = await uploadToDrive(file, file.name, file.type);
    
    // Nếu file là ảnh, trả về link trực tiếp luôn để chèn thẳng vào bài/thumbnail
    const isImage = file.type.startsWith("image/");
    const finalUrl = isImage ? getDirectImageUrl(result.url) : result.url;

    return { success: true, url: finalUrl };
  } catch (error: any) {
    console.error("Lỗi upload:", error);
    return { success: false, error: error.message };
  }
}
