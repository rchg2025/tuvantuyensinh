"use server";

import { google } from "googleapis";
import { getDriveAuth, getDriveConfig } from "@/lib/gdrive";

export async function getDriveFiles() {
  try {
    const auth = await getDriveAuth();
    const { folderId } = await getDriveConfig();
    const drive = google.drive({ version: "v3", auth });

    if (!folderId) {
      throw new Error("Chưa cấu hình Folder ID trong Cấu hình hệ thống");
    }

    // Lấy các file trong folderId và không nằm trong thùng rác
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, webViewLink, webContentLink, createdTime, thumbnailLink, size)",
      orderBy: "createdTime desc",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 1000,
    });

    return {
      success: true,
      files: res.data.files || []
    };
  } catch (error: any) {
    console.error("Error fetching drive files:", error);
    return {
      success: false,
      message: error.message || "Lỗi khi lấy danh sách tệp",
      files: []
    };
  }
}

export async function trashDriveFile(fileId: string) {
  try {
    const auth = await getDriveAuth();
    const drive = google.drive({ version: "v3", auth });

    // Update file để move vào thùng rác (trashed = true)
    await drive.files.update({
      fileId: fileId,
      requestBody: {
        trashed: true,
      },
      supportsAllDrives: true,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error trashing drive file:", error);
    return { success: false, message: error.message || "Lỗi khi xóa tệp" };
  }
}
