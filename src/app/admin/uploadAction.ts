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

export async function listMediaAction(pageToken?: string, query?: string) {
  try {
    const { listDriveFiles, getDirectImageUrl } = await import("@/lib/gdrive");
    const result = await listDriveFiles(pageToken, query);
    
    // Transform URLs to direct image URLs if they are images
    const files = result.files.map(file => {
      const isImage = file.mimeType?.startsWith("image/");
      const webViewLink = file.webViewLink || "";
      let url = webViewLink;
      
      if (webViewLink.includes('drive.google.com/file/d/')) {
         const id = webViewLink.split('/d/')[1]?.split('/')[0];
         if (id) {
             url = "https://drive.google.com/uc?export=view&id=" + id;
         }
      } else if (file.webContentLink) {
         // Alternatively use webContentLink if available
         url = file.webContentLink;
      }

      const finalUrl = isImage ? getDirectImageUrl("https://drive.google.com/uc?export=view&id=" + file.id) : url;

      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        url: finalUrl,
        thumbnail: file.thumbnailLink || finalUrl, // use thumbnailLink if available
        createdTime: file.createdTime
      };
    });

    return { success: true, files, nextPageToken: result.nextPageToken };
  } catch (error: any) {
    console.error("Lỗi listMediaAction:", error);
    return { success: false, error: error.message };
  }
}
