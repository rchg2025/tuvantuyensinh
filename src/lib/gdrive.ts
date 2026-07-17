import { google } from "googleapis";
import prisma from "@/lib/prisma";

export async function getDriveConfig() {
  const configs = await prisma.systemConfig.findMany({
    where: {
      key: { in: ["GDRIVE_SERVICE_EMAIL", "GDRIVE_PRIVATE_KEY", "GDRIVE_FOLDER_ID"] },
    },
  });

  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    email: configMap["GDRIVE_SERVICE_EMAIL"],
    privateKey: configMap["GDRIVE_PRIVATE_KEY"],
    folderId: configMap["GDRIVE_FOLDER_ID"],
  };
}

export async function getDriveAuth() {
  const { email, privateKey } = await getDriveConfig();

  if (!email || !privateKey) {
    throw new Error("Chua cau hinh Email hoac Private Key");
  }

  let formattedPrivateKey = privateKey;
  try {
    const parsed = JSON.parse(privateKey);
    if (parsed.private_key) {
      formattedPrivateKey = parsed.private_key;
    }
  } catch (e) {
    formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: formattedPrivateKey,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return auth;
}

export async function testDriveConnection() {
  try {
    const auth = await getDriveAuth();
    const drive = google.drive({ version: "v3", auth });
    
    const res = await drive.files.list({
      pageSize: 1,
      fields: "nextPageToken, files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    return { success: true, message: "Ket noi Google Drive thanh cong!" };
  } catch (error: any) {
    console.error("Loi Google Drive:", error);
    return { success: false, message: "Loi ket noi: " + error.message };
  }
}

export function getDirectImageUrl(url: string | null | undefined, widthOrOgMode: number | boolean = false): string {
  if (!url) return "";
  if (url.includes('drive.google.com/uc?export=view&id=')) {
    const id = url.split('id=')[1]?.split('&')[0];
    if (id) {
      if (typeof widthOrOgMode === 'boolean') {
         return widthOrOgMode ? `https://lh3.googleusercontent.com/d/${id}=w1200` : `https://lh3.googleusercontent.com/d/${id}=w1000`;
      }
      return `https://lh3.googleusercontent.com/d/${id}=w${widthOrOgMode}`;
    }
  }
  return url;
}

export async function getOrCreateDriveFolder(drive: any, parentId: string, folderName: string): Promise<string> {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const createRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  return createRes.data.id!;
}

export async function getUploadFolderId(drive: any, rootFolderId: string): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  const yearFolderId = await getOrCreateDriveFolder(drive, rootFolderId, year);
  const monthFolderId = await getOrCreateDriveFolder(drive, yearFolderId, month);
  
  return monthFolderId;
}

export async function uploadToDrive(file: File, fileName: string, mimeType: string) {
  const auth = await getDriveAuth();
  const { folderId } = await getDriveConfig();
  const drive = google.drive({ version: "v3", auth });

  if (!folderId) {
    throw new Error("Chua cau hinh Folder ID");
  }

  const targetFolderId = await getUploadFolderId(drive, folderId);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data } = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [targetFolderId],
      mimeType: mimeType,
    },
    media: {
      mimeType: mimeType,
      body: require("stream").Readable.from(buffer),
    },
    fields: "id, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  if (!data.id) throw new Error("Upload that bai - khong lay duoc ID");

  await drive.permissions.create({
    fileId: data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
  });

  return {
    id: data.id,
    url: "https://drive.google.com/uc?export=view&id=" + data.id
  };
}

export async function createResumableUpload(fileName: string, mimeType: string, origin?: string) {
  const auth = await getDriveAuth();
  const { folderId } = await getDriveConfig();
  const drive = google.drive({ version: "v3", auth });
  
  const token = await auth.getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Upload-Content-Type": mimeType,
  };

  if (origin) {
    headers["Origin"] = origin;
  }

  if (!folderId) {
    throw new Error("Chua cau hinh Folder ID");
  }

  const targetFolderId = await getUploadFolderId(drive, folderId);

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      name: fileName,
      parents: [targetFolderId],
    })
  });

  const uploadUrl = response.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("Không lấy được link upload từ Google Drive");
  }
  return uploadUrl;
}

export async function makeFilePublic(fileId: string) {
  const auth = await getDriveAuth();
  const drive = google.drive({ version: "v3", auth });
  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
  });
  return "https://drive.google.com/uc?export=view&id=" + fileId;
}

export async function listDriveFiles(pageToken?: string, query?: string) {
  const auth = await getDriveAuth();
  const { folderId } = await getDriveConfig();
  const drive = google.drive({ version: "v3", auth });

  if (!folderId) {
    throw new Error("Chua cau hinh Folder ID");
  }

  // Get all subfolders up to 2 levels deep (year -> month)
  let folderIds = [folderId];
  try {
    const res1 = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    if (res1.data.files && res1.data.files.length > 0) {
      const yearIds = res1.data.files.map(f => f.id!);
      folderIds.push(...yearIds);
      
      const parts = yearIds.map(id => `'${id}' in parents`);
      const q2 = `(${parts.join(' or ')}) and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const res2 = await drive.files.list({
        q: q2,
        fields: "files(id)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      if (res2.data.files && res2.data.files.length > 0) {
        folderIds.push(...res2.data.files.map(f => f.id!));
      }
    }
  } catch (e) {
    console.error("Lỗi khi tìm thư mục con:", e);
  }

  const parentQuery = folderIds.map(id => `'${id}' in parents`).join(' or ');
  let q = `(${parentQuery}) and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
  
  if (query) {
    q += ` and ${query}`;
  }

  const res = await drive.files.list({
    q: q,
    pageSize: 30, // 30 files per page
    pageToken: pageToken,
    fields: "nextPageToken, files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, createdTime)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    orderBy: "createdTime desc" // Mới nhất lên trước
  });

  return {
    files: res.data.files || [],
    nextPageToken: res.data.nextPageToken
  };
}
