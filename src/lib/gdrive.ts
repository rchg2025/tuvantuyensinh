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

export function getDirectImageUrl(url: string | null | undefined, ogMode: boolean = false): string {
  if (!url) return "";
  if (url.includes('drive.google.com/uc?export=view&id=')) {
    const id = url.split('id=')[1]?.split('&')[0];
    if (id) {
      if (ogMode) {
         return `https://lh3.googleusercontent.com/d/${id}=w1200`;
      }
      return `https://lh3.googleusercontent.com/d/${id}=w1000`;
    }
  }
  return url;
}

export async function uploadToDrive(file: File, fileName: string, mimeType: string) {
  const auth = await getDriveAuth();
  const { folderId } = await getDriveConfig();
  const drive = google.drive({ version: "v3", auth });

  if (!folderId) {
    throw new Error("Chua cau hinh Folder ID");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data } = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
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
