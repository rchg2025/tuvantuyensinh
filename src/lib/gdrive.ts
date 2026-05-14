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
    throw new Error("Chưa cấu hình Email hoặc Private Key");
  }

  let formattedPrivateKey = privateKey;
  // If the user pasted the raw JSON instead of just the private key string, we can extract it
  try {
    const parsed = JSON.parse(privateKey);
    if (parsed.private_key) {
      formattedPrivateKey = parsed.private_key;
    }
  } catch (e) {
    // maybe it is the raw key with \n
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
    
    // Test list files to see if access is successful
    const res = await drive.files.list({
      pageSize: 1,
      fields: "nextPageToken, files(id, name)",
    });

    return { success: true, message: "Kết nối Google Drive thành công!" };
  } catch (error: any) {
    console.error("Lỗi Google Drive:", error);
    return { success: false, message: `Lỗi kết nối: ${error.message}` };
  }
}

export async function uploadToDrive(file: File, fileName: string, mimeType: string) {
  const auth = await getDriveAuth();
  const { folderId } = await getDriveConfig();
  const drive = google.drive({ version: "v3", auth });

  if (!folderId) {
    throw new Error("Chưa cấu hình Folder ID");
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
  });

  if (!data.id) throw new Error("Upload thất bại - không lấy được ID");

  // Make public
  await drive.permissions.create({
    fileId: data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    id: data.id,
    url: `https://drive.google.com/uc?export=view&id=${data.id}`
  };
}
