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

import { headers } from "next/headers";

export async function getResumableUrlAction(fileName: string, mimeType: string) {
  try {
    const { createResumableUpload } = await import("@/lib/gdrive");
    const headersList = await headers();
    const origin = headersList.get("origin") || "";
    
    const uploadUrl = await createResumableUpload(fileName, mimeType, origin);
    return { success: true, uploadUrl };
  } catch (error: any) {
    console.error("Lỗi getResumableUrl:", error);
    return { success: false, error: error.message };
  }
}

export async function finalizeUploadAction(fileId: string, mimeType: string) {
  try {
    const { makeFilePublic, getDirectImageUrl } = await import("@/lib/gdrive");
    const url = await makeFilePublic(fileId);
    const isImage = mimeType.startsWith("image/");
    const finalUrl = isImage ? getDirectImageUrl(url) : url;
    return { success: true, url: finalUrl };
  } catch (error: any) {
    console.error("Lỗi finalizeUpload:", error);
    return { success: false, error: error.message };
  }
}
